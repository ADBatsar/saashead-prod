import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is missing or empty in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. EXTRACT RAW TEXT FROM PDF
    const extractedText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
      pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
      pdfParser.parseBuffer(buffer);
    });

    const normalizedText = extractedText.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').trim();

    // 2. AI EXTRACTION VIA GEMINI
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      Analyze the following document (invoice, contract, receipt, PO, etc.) and extract the key billing and vendor details. 
      Pay careful attention to the line items to determine the number of licenses/seats and the unit price.
      
      Return a valid JSON object strictly matching this schema:
      {
        "appName": "The name of the software, product, or SaaS platform (e.g., Unity Pro, Slack, Fivetran, AWS)",
        "invoiceId": "The unique Invoice Number, Receipt Number, Document ID, Order Number, or Contract ID found. If not found, leave empty string",
        "billingCycle": "Determine if the service period covers a full year or just a month. Return exactly 'yearly' or 'monthly'",
        "licenseCount": "The total number of licenses, seats, or quantity of the software purchased (number only). Default to 1 if not explicitly stated",
        "unitPrice": "The numeric cost per single license/seat (number only, no currency symbols). Do not return the grand total unless licenseCount is 1",
        "renewalDate": "The next billing date, due date, or end date of the service period in YYYY-MM-DD format",
        "vendorName": "The official legal name of the vendor or billing entity",
        "website": "The official website URL or domain of the vendor, if found. Otherwise, leave empty string",
        "contactName": "The specific representative, account manager, or billing contact person, if found. Otherwise, leave empty string",
        "contactEmail": "The support, billing, or contact email of the vendor, if found. Otherwise, leave empty string",
        "contactPhone": "The support, billing, or representative mobile/phone number of the vendor, if found. Otherwise, leave empty string"
      }
      
      Document Text:
      """
      ${normalizedText}
      """
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    const parsedData = JSON.parse(aiResponse);

    // 3. DATE VALIDATION & EXPIRATION CHECK
    let finalDate = "";
    let isExpired = false;
    
    if (parsedData.renewalDate) {
      const d = new Date(parsedData.renewalDate);
      if (!isNaN(d.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        if (d < today) {
          isExpired = true;
        }
        finalDate = d.toISOString().split('T')[0]; 
      }
    }

    // Ensure valid numbers
    const seats = parsedData.licenseCount ? parseInt(parsedData.licenseCount, 10) : 1;
    const unitPrice = parsedData.unitPrice ? parseFloat(parsedData.unitPrice) : 0;
    
    // Normalize cycle
    const cycle = parsedData.billingCycle?.toLowerCase() === "yearly" ? "yearly" : "monthly";

    // Because the form expects "cost per cycle" (e.g. Total Yearly Cost if yearly),
    // we calculate the combined total for the cycle.
    const calculatedCycleCost = seats * unitPrice;

    return NextResponse.json({
      success: true,
      message: "PDF successfully parsed via AI!",
      match: true, 
      appDetails: {
        name: parsedData.appName || "",
        invoiceId: parsedData.invoiceId || "",
        billingCycle: cycle,
        seats_total: seats,
        cost: calculatedCycleCost, // Sending the combined cost to populate the UI correctly
        renewalDate: finalDate,
        isExpired: isExpired,
        vendorName: parsedData.vendorName || "",
        website: parsedData.website || "",
        contactName: parsedData.contactName || "",
        contactEmail: parsedData.contactEmail || "",
        contactPhone: parsedData.contactPhone || ""
      }
    });

  } catch (error: any) {
    console.error("Critical Upload/AI Parsing Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Server Error: ${error.message}` 
    }, { status: 500 });
  }
}
