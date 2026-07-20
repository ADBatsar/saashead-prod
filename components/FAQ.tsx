export default function FAQ() {
  const faqs = [
    {
      question: "What is HeadSaaS?",
      answer:
        "HeadSaaS is a SaaS management platform that helps organizations discover applications, optimize licenses, manage renewals, and control software spending."
    },
    {
      question: "Does HeadSaaS integrate with Salesforce?",
      answer:
        "Yes. HeadSaaS integrates with Salesforce to provide visibility into customer-facing applications and business workflows."
    },
    {
      question: "Does HeadSaaS support SAP integration?",
      answer:
        "Yes. HeadSaaS integrates with SAP to align SaaS governance with procurement and financial processes."
    },
    {
      question: "Can I track software renewals?",
      answer:
        "Absolutely. HeadSaaS provides centralized renewal tracking and notifications to prevent missed deadlines."
    },
    {
      question: "Can I discover Shadow IT?",
      answer:
        "Yes. HeadSaaS helps identify unauthorized or unmanaged SaaS applications across your organization."
    },
    {
      question: "Is HeadSaaS free?",
      answer:
        "Currently all HeadSaaS plans are available at no cost while the platform continues to evolve."
    }
  ];

  return (
    <section
      id="faq"
      className="py-32"
    >
      <div className="section-container">

        <div className="text-center mb-16">

          <div
            className="
            glass
            inline-block
            px-6
            py-2
            rounded-full
            mb-6
            "
          >
            Frequently Asked Questions
          </div>

          <h2
            className="
            text-4xl
            md:text-5xl
            font-bold
            mb-4
            "
          >
            Questions About
            <span className="gradient-text">
              {" "}HeadSaaS
            </span>
          </h2>

        </div>

        <div className="max-w-4xl mx-auto space-y-6">

          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="
              glass
              rounded-2xl
              p-6
              "
            >
              <h3 className="text-xl font-semibold mb-3">
                {faq.question}
              </h3>

              <p className="text-gray-400">
                {faq.answer}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
