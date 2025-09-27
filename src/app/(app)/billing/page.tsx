import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const plans = [
  {
    name: 'Starter',
    price: '$10',
    period: '/month',
    description: 'For individuals and small teams starting out.',
    features: [
      'Up to 50 document analyses',
      'Basic conflict reporting',
      'Email support',
    ],
    cta: 'Choose Plan',
  },
  {
    name: 'Pro',
    price: '$40',
    period: '/month',
    description: 'For growing businesses with more complex needs.',
    features: [
      'Up to 250 document analyses',
      'Detailed conflict reporting with suggestions',
      'Priority email support',
      'API access',
    ],
    cta: 'Choose Plan',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    period: '',
    description: 'For large organizations with custom requirements.',
    features: [
      'Unlimited document analyses',
      'Advanced compliance monitoring',
      'Dedicated account manager',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Flexible Pricing for Every Team
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Pay-per-use or subscribe. The choice is yours.
        </p>
      </div>

      <div className="grid max-w-5xl mx-auto gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${
              plan.popular ? 'border-primary ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader className="relative">
              {plan.popular && (
                <div className="absolute top-0 right-4 -mt-3.5">
                  <span className="px-3 py-1 text-sm font-semibold tracking-wide text-primary-foreground bg-primary rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardTitle className="font-headline">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="ml-1 text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Usage this month</CardTitle>
          <CardDescription>
            Your current usage based on your plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Documents Analyzed
            </p>
            <p className="text-2xl font-bold">27 / 50</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Next Billing Date
            </p>
            <p className="text-2xl font-bold">July 15, 2024</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
