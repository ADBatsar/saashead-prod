
export default function Hero() {
  return (
    <section
      className="
      pt-32
  min-h-[80vh]
      flex
      items-center
      justify-center
      relative
      overflow-hidden
      "
    >
      <div
        className="
        absolute
        inset-0
        bg-gradient-to-r
        from-purple-900/30
        via-fuchsia-500/10
        to-cyan-500/10
        blur-3xl
        "
      />

      <div
        className="
        section-container
        text-center
        relative
        z-10
        "
      >

      <div
  className="
  inline-block
  px-6
  py-2
  rounded-full
  glass
  mb-8
  "
>
  🚀 AI-Powered SaaS Management Platform
</div>
<h1
  className="
  text-4xl
  md:text-6xl
  lg:text-7xl
  font-bold
  leading-tight
  "
>
  Take Control Of Your
  <br />

  <span className="gradient-text">
    Entire SaaS Ecosystem
  </span>
</h1>

<p
  className="
  text-lg
  md:text-xl
  text-gray-300
  max-w-4xl
  mx-auto
  mt-8
  "
>
  Discover applications, eliminate SaaS waste,
  optimize software spending, manage renewals,
  and gain complete visibility across your
  organization through Salesforce and SAP
  integrations.
</p>
        <div
          className="
          flex
          justify-center
          gap-4
          mt-10
          "
        >
          <button
            className="
            bg-purple-600
            px-8
            py-4
            rounded-xl
            "
          >
            Start Free
          </button>

          <button
            className="
            border
            border-purple-500
            px-8
            py-4
            rounded-xl
            "
          >
            Request Demo
          </button>
        </div>

        <div
	className="
glass
mt-16
mb-24
rounded-3xl
p-8
max-w-5xl
mx-auto
"
        >
        <div className="grid md:grid-cols-4 gap-6 text-center">    
	<div>
  <p className="text-gray-400 text-sm uppercase tracking-wider">
	Applications Managed
</p>

<h3 className="text-4xl font-bold">
  100+
</h3>
            </div>

            <div>
	    <p className="text-gray-400">
  Annual SaaS Spend
</p>

<h3 className="text-4xl font-bold">
  $0
</h3>
            </div>

            <div>
	    <p className="text-gray-400">
  Cost Reduction
</p>

<h3 className="text-4xl font-bold">
  30%
</h3>
            </div>

            <div>
	    <p className="text-gray-400">
  Enterprise Integrations
</p>

<h3 className="text-4xl font-bold">
  00
</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


