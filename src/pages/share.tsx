import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Expense Summary for {data.person}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg">
              Total amount owed to <span className="font-semibold">{data.owedTo}</span>:{" "}
              <span className="text-primary font-bold">${data.totalOwed.toFixed(2)}</span>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Expense Breakdown:</h3>
              {data.expenses.map((expense: any, index: number) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <div className="font-medium">{expense.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Total expense: ${expense.totalAmount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your share: ${expense.amount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Paid by: {expense.paidBy}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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