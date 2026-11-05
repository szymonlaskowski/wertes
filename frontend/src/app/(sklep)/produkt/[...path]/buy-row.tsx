import { Button } from "@/components/button";

export function BuyRow() {
  return (
    <div className="z-10 flex items-end gap-1 bg-paper max-md:sticky max-md:bottom-0 max-md:-mx-2 max-md:px-2 max-md:py-1.5">
      <label className="flex flex-col font-semibold">
        Ilość
        <input
          type="number"
          name="quantity"
          defaultValue={1}
          min={1}
          step={1}
          inputMode="numeric"
          required
          className="mt-1 h-6 w-10 rounded-box bg-surface px-2 font-normal tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </label>
      <Button variant="primary" type="submit">
        Dodaj do koszyka
      </Button>
    </div>
  );
}
