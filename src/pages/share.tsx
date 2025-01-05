import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const SharePage = () => {
  const [searchParams] = useSearchParams();
  const sharedData = searchParams.get("data");
  
  if (!sharedData) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">
          No expense data found.
        </div>
      </div>
    );
  }

  try {
    const data = JSON.parse(decodeURIComponent(sharedData));
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Expense Summary for {data.person}</CardTitle>
              <p className="text-muted-foreground">
                Amount owed to <span className="font-semibold">{data.owedTo}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-2xl font-bold text-primary">
                Total amount to pay: ${data.totalOwed.toFixed(2)}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Expense Breakdown:</h3>
                {data.expenses.map((expense: any, index: number) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-lg">{expense.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Paid by {expense.paidBy}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Your share: ${expense.amount}</div>
                          <div className="text-sm text-muted-foreground">
                            Total expense: ${expense.totalAmount}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-muted-foreground">
          Invalid expense data.
        </div>
      </div>
    );
  }
};

export default SharePage;