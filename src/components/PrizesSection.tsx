import { Car, Smartphone, Laptop, Watch, DollarSign, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const prizes = [
  {
    icon: Car,
    title: "Brand New Car",
    value: "Worth up to ₹15,00,000"
  },
  {
    icon: Smartphone,
    title: "Premium Smartphone",
    value: "Latest flagship models"
  },
  {
    icon: Laptop,
    title: "Gaming Laptop",
    value: "High-end gaming rigs"
  },
  {
    icon: Watch,
    title: "Smartwatch",
    value: "Premium wearables"
  },
  {
    icon: DollarSign,
    title: "Cash Prizes",
    value: "Up to ₹10,00,000"
  },
  {
    icon: Plane,
    title: "Travel Vouchers",
    value: "Dream destinations"
  }
];

const PrizesSection = () => {
  return (
    <section id="prizes" className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">🎁 Exciting Prizes Await</h2>
          <p className="text-xl text-muted-foreground">Win amazing prizes from cars to gadgets!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {prizes.map((prize, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-all hover:shadow-xl hover:scale-105 duration-300">
              <CardContent className="pt-10 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground mb-6">
                  <prize.icon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{prize.title}</h3>
                <p className="text-muted-foreground text-lg">{prize.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrizesSection;
