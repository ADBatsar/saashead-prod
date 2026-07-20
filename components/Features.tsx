const features = [
  {
    title: "SaaS Discovery",
    text: "Automatically discover every SaaS application in your organization."
  },
  {
    title: "License Optimization",
    text: "Identify unused licenses and reduce software waste."
  },
  {
    title: "Spend Analytics",
    text: "Track spending across departments and vendors."
  },
  {
    title: "Renewal Tracking",
    text: "Never miss subscription or contract renewals."
  },
  {
    title: "Salesforce Integration",
    text: "Connect CRM data directly into SaaS governance."
  },
  {
    title: "SAP Integration",
    text: "Align software spending with procurement workflows."
  }
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-32"
    >
      <div className="section-container">

        <h2
          className="
          text-center
          text-5xl
          font-bold
          mb-16
          "
        >
          Everything You Need
        </h2>

        <div
          className="
          grid
          md:grid-cols-3
          gap-8
          "
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="
              glass
              rounded-2xl
              p-8
              "
            >
              <h3
                className="
                text-2xl
                font-semibold
                mb-4
                "
              >
                {feature.title}
              </h3>

              <p className="text-gray-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
