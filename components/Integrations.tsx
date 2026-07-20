export default function Integrations() {
  const integrations = [
    {
      title: "Salesforce",
      description: "Sync CRM, accounts and customer data."
    },
    {
      title: "SAP",
      description: "Connect procurement and finance systems."
    },
    {
      title: "Microsoft 365",
      description: "Discover licenses and user activity."
    },
    {
      title: "Google Workspace",
      description: "Manage users, apps and permissions."
    },
    {
      title: "Slack",
      description: "Monitor collaboration tool usage."
    },
    {
      title: "Jira",
      description: "Track engineering and project tools."
    },
    {
      title: "Okta",
      description: "Identity and access visibility."
    },
    {
      title: "ServiceNow",
      description: "Govern enterprise service workflows."
    }
  ];

  return (
    <section
      id="integrations"
      className="py-32"
    >
      <div className="section-container">

        <div className="text-center mb-16">

          <div
            className="
            inline-block
            glass
            px-6
            py-2
            rounded-full
            mb-6
            "
          >
            Enterprise Integrations
          </div>

          <h2
            className="
            text-4xl
            md:text-5xl
            font-bold
            mb-4
            "
          >
            Connect Your Entire
            <span className="gradient-text">
              {" "}Software Ecosystem
            </span>
          </h2>

          <p className="text-gray-400">
            Seamlessly integrate with the tools your business already uses.
          </p>

        </div>

        <div className="grid md:grid-cols-4 gap-6">

          {integrations.map((item) => (
            <div
              key={item.title}
              className="
              glass
              rounded-3xl
              p-8
              hover:scale-105
              transition-all
              duration-300
              "
            >
              <h3 className="text-xl font-semibold mb-3">
                {item.title}
              </h3>

              <p className="text-gray-400 text-sm">
                {item.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}


