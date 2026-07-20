export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-10">
      <div className="section-container">

        <div className="flex flex-col md:flex-row justify-between gap-8">

          <div>
            <h3 className="text-2xl font-bold">
              HeadSaaS
            </h3>

            <p className="text-gray-400 mt-2">
              The Mastermind For Your SaaS Stack.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">
              Platform
            </h4>

            <ul className="space-y-2 text-gray-400">
              <li>Discovery</li>
              <li>Optimization</li>
              <li>Governance</li>
              <li>Renewals</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">
              Integrations
            </h4>

            <ul className="space-y-2 text-gray-400">
              <li>Salesforce</li>
              <li>SAP</li>
              <li>Microsoft 365</li>
              <li>Google Workspace</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">
              Company
            </h4>

            <ul className="space-y-2 text-gray-400">
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 text-center text-gray-500">
          © 2026 HeadSaaS. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
