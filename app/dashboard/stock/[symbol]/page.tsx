import { StockDetailPage } from "@/components/stock/stock-detail";

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <StockDetailPage symbol={symbol} />;
}
