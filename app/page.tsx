import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    href: "/request/feature",
    title: "Request a Feature",
    description:
      "Have an idea or a need? Submit it to our delivery backlog on Azure DevOps. We'll review, prioritise, and get back to you.",
    hoverColor: "hover:border-blue-300",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-semibold text-neutral-900">
          DevOps Front Door
        </h1>
        <p className="mt-3 text-neutral-500 max-w-xl mx-auto">
          The single entry point for working with the DevOps team. Choose below
          to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <Card
              className={`h-full transition-colors border-2 border-transparent ${card.hoverColor}`}
            >
              <CardHeader>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
