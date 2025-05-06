import { Card, CardContent, CardHeader, CardTitle } from "./card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DashCard = ({ cardTitle, cardContent, count ,children}:any) => {
  return (
    <>
      <Card className="bg-gradient-to-br from-background to-secondary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold">{cardTitle}</CardTitle>
          {children}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-xs text-gray-500">{cardContent}</p>
        </CardContent>
      </Card>
    </>
  );
};

export default DashCard;
