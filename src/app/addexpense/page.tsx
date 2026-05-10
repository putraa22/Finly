import { AddExpenseScreen } from "./_components/AddExpenseScreen";

export default function AddExpensePage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-5 sm:max-w-lg md:max-w-xl lg:max-w-5xl">
        <AddExpenseScreen />
      </div>
    </div>
  );
}
