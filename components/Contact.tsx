export default function Contact() {
  return (
    <section
      id="contact"
      className="py-32"
    >
      <div className="section-container">

        <div
          className="
          glass
          rounded-3xl
          p-12
          max-w-5xl
          mx-auto
          "
        >

          <div className="text-center mb-12">

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
              Contact Us
            </div>

            <h2
              className="
              text-4xl
              md:text-5xl
              font-bold
              mb-4
              "
            >
              Ready To Take Control Of Your
              <span className="gradient-text">
                {" "}SaaS Ecosystem?
              </span>
            </h2>

            <p className="text-gray-400">
              Request a demo and see how HeadSaaS can help
              manage your entire software portfolio.
            </p>

          </div>

          <form className="grid md:grid-cols-2 gap-6">

            <input
              type="text"
              placeholder="Full Name"
              className="
              bg-transparent
              border
              border-gray-700
              rounded-xl
              p-4
              "
            />

            <input
              type="email"
              placeholder="Business Email"
              className="
              bg-transparent
              border
              border-gray-700
              rounded-xl
              p-4
              "
            />

            <input
              type="text"
              placeholder="Company Name"
              className="
              bg-transparent
              border
              border-gray-700
              rounded-xl
              p-4
              "
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="
              bg-transparent
              border
              border-gray-700
              rounded-xl
              p-4
              "
            />

            <textarea
              placeholder="Tell us about your SaaS environment..."
              rows={5}
              className="
              md:col-span-2
              bg-transparent
              border
              border-gray-700
              rounded-xl
              p-4
              "
            />

            <button
              className="
              md:col-span-2
              bg-purple-600
              hover:bg-purple-700
              rounded-xl
              p-4
              font-semibold
              "
            >
              Request Demo
            </button>

          </form>

        </div>

      </div>
    </section>
  );
}
