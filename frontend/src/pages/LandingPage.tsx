import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingDown,
  Shield,
  BarChart3,
  Zap,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "../shared/lib/cn";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Cost Attribution",
    description:
      "Track spend by user, team, project, and agent with granular visibility.",
  },
  {
    icon: TrendingDown,
    title: "Waste Detection",
    description:
      "Automatically flag repeated prompts, over-reasoning, and bloated context windows.",
  },
  {
    icon: Shield,
    title: "Budget Enforcement",
    description:
      "Hard and soft controls with caps, limits, and real-time alerts.",
  },
  {
    icon: Zap,
    title: "Prompt Intelligence",
    description:
      "Smart optimization suggestions and automatic prompt classification.",
  },
] as const;

const BENEFITS = [
  "Cut your AI API bill by 30%",
  "Stop runaway agents before they cost you",
  "Full audit trail for compliance",
  "Enterprise-ready with SOC 2 alignment",
] as const;

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/80 to-white">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230284c7' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800 animate-fade-in"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              The FinOps layer for LLM usage
            </p>
            <h1
              className="font-display text-fluid-4xl font-bold tracking-tight text-gray-900 animate-fade-in sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              The AWS Cost Explorer{" "}
              <span className="text-primary-700">for LLMs</span>
            </h1>
            <p
              className="mt-6 text-fluid-lg text-gray-700 animate-fade-in"
              style={{ animationDelay: "160ms" }}
            >
              Track, attribute, and optimize your LLM API spend. Stop overspending
              before the invoice arrives.
            </p>
            <div
              className="mt-10 flex flex-col items-center justify-center gap-4 animate-slide-up sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/login"
                className={cn(
                  "inline-flex min-h-[3rem] min-w-[11rem] items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-200",
                  "bg-primary-600 hover:bg-primary-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                  "active:scale-[0.98] touch-manipulation",
                )}
              >
                Get started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <a
                href="#features"
                className={cn(
                  "inline-flex min-h-[3rem] min-w-[11rem] items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900",
                  "hover:border-gray-400 hover:bg-gray-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                  "active:scale-[0.98] touch-manipulation",
                )}
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y border-gray-200 bg-gray-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, i) => (
              <div
                key={benefit}
                className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200/80 transition-shadow hover:shadow-md"
                style={{
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <CheckCircle
                  className="h-6 w-6 flex-shrink-0 text-primary-600"
                  aria-hidden
                />
                <p className="text-base font-medium text-gray-900">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-fluid-3xl font-bold text-gray-900">
              Everything you need to control AI costs
            </h2>
            <p className="mt-4 text-fluid-base text-gray-700">
              A secure LLM proxy and financial intelligence layer that turns token
              usage into actionable insights.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className={cn(
                    "rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300",
                    "hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50",
                    "animate-slide-up",
                  )}
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                      <Icon className="h-7 w-7" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-fluid-xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-fluid-base text-gray-700">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-fluid-3xl font-bold text-white">
            Ready to take control of your AI costs?
          </h2>
          <p className="mt-4 text-fluid-lg text-primary-100">
            Start tracking and optimizing your LLM usage today.
          </p>
          <Link
            to="/login"
            className={cn(
              "mt-8 inline-flex min-h-[3rem] min-w-[11rem] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-lg",
              "hover:bg-primary-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700",
              "active:scale-[0.98] touch-manipulation",
            )}
          >
            Get started free
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-white">AI Cost Auditor</p>
            <p className="mt-2 text-sm text-gray-400">
              The AWS Cost Explorer for LLMs — guardrails that stop waste before it
              happens.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
