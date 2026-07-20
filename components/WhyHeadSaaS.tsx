export default function WhyHeadSaaS() {
  const benefits = [
    {
      title: "Discover Shadow IT",
      description:
        "Automatically identify unauthorized SaaS applications across your organization."
    },
    {
      title: "Reduce SaaS Costs",
      description:
        "Eliminate duplicate subscriptions and optimize software spending."
    },
    {
      title: "License Optimization",
      description:
        "Track utilization and reclaim unused licenses."
    },
    {
      title: "Renewal Management",
      description:
        "Never miss a contract renewal or subscription deadline."
    },
    {
      title: "Salesforce Integration",
      description:
        "Connect CRM and business workflows directly."
    },
    {
      title: "SAP Integration",
      description:
        "Align SaaS governance with procurement and finance."
    }
  ];

  return (
    <section className="py-32">
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
            Why HeadSaaS
          </div>

          <h2
            className="
            text-4xl
            md:text-5xl
            font-bold
            mb-4
            "
          >
            Built For Modern
            <span className="gradient-text">
              {" "}Enterprise Teams
            </span>
          </h2>

          <p className="text-gray-400">
            Everything you need to manage your SaaS ecosystem.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {benefits.map((item) => (
            <div
              key={item.title}
              className="
              glass
              rounded-3xl
              p-8
              "
            >
              <h3 className="text-xl font-semibold mb-4">
                {item.title}
              </h3>

              <p className="text-gray-400">
                {item.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
