import type { Product, VariationDetails } from "@/lib/store-api";

const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"];

export type ChoiceOption = { value: string; label: string; image: string | undefined };
export type VariantChoice = { name: string; formField: string; options: ChoiceOption[]; showsImages: boolean };
export type FormField = { name: string; value: string };
export type PickerVariant = {
  id: number;
  sku: string;
  inStock: boolean;
  priceHtml: string;
  image: string | undefined;
  choiceValues: Record<string, string>;
  hiddenFields: FormField[];
};
export type VariantPicker = { choices: VariantChoice[]; variants: PickerVariant[] };
export type Selection = Record<string, string>;

export function buildVariantPicker(product: Product, details: VariationDetails[]): VariantPicker {
  const choiceNames = choiceAttributeNames(product);
  const variants: PickerVariant[] = [];
  for (const variation of product.variations) {
    const variationDetails = details.find((candidate) => candidate.id === variation.id);
    const isPublished = variationDetails !== undefined;
    if (isPublished) {
      variants.push(pickerVariant(product, variation, variationDetails, choiceNames));
    }
  }
  const choices = choiceNames.map((name) => variantChoice(product, name, variants));
  return { choices, variants };
}

export function choiceAttributeNames(product: Product) {
  const valuesByName = new Map<string, Set<string>>();
  for (const variation of product.variations) {
    for (const attribute of variation.attributes) {
      const values = valuesByName.get(attribute.name) ?? new Set<string>();
      if (attribute.value !== null) {
        values.add(attribute.value);
      }
      valuesByName.set(attribute.name, values);
    }
  }

  const names: string[] = [];
  for (const [name, values] of valuesByName) {
    const customerHasAChoice = values.size > 1;
    if (customerHasAChoice) {
      names.push(name);
    }
  }
  const onlyOneVariationExists = names.length === 0;
  if (onlyOneVariationExists) {
    return [...valuesByName.keys()];
  }
  return names;
}

function pickerVariant(
  product: Product,
  variation: Product["variations"][number],
  details: VariationDetails,
  choiceNames: string[],
): PickerVariant {
  const choiceValues: Selection = {};
  const hiddenFields: FormField[] = [];
  for (const attribute of variation.attributes) {
    const productAttribute = findProductAttribute(product, attribute.name);
    const acceptsAnyValue = attribute.value === null;
    const value = attribute.value ?? firstTermSlug(productAttribute);
    if (choiceNames.includes(attribute.name)) {
      choiceValues[attribute.name] = value;
    } else if (acceptsAnyValue) {
      hiddenFields.push({ name: attributeFormField(productAttribute), value });
    }
  }

  return {
    id: variation.id,
    sku: details.sku,
    inStock: details.is_in_stock,
    priceHtml: details.price_html,
    image: details.images.at(0)?.src,
    choiceValues,
    hiddenFields,
  };
}

function variantChoice(product: Product, name: string, variants: PickerVariant[]): VariantChoice {
  const productAttribute = findProductAttribute(product, name);
  const options: ChoiceOption[] = [];
  for (const variant of variants) {
    const value = variant.choiceValues[name];
    const isNewValue = !options.some((option) => option.value === value);
    if (isNewValue) {
      options.push({ value, label: termName(productAttribute, value), image: variant.image });
    }
  }
  options.sort((first, second) => compareSizes(first.label, second.label));

  return {
    name,
    formField: attributeFormField(productAttribute),
    options,
    showsImages: everyOptionHasItsOwnImage(options),
  };
}

function everyOptionHasItsOwnImage(options: ChoiceOption[]) {
  const images = new Set<string>();
  for (const option of options) {
    if (option.image === undefined) {
      return false;
    }
    images.add(option.image);
  }
  return options.length > 1 && images.size === options.length;
}

type ProductAttribute = Product["attributes"][number];

function findProductAttribute(product: Product, name: string) {
  const productAttribute = product.attributes.find((attribute) => attribute.name === name);
  if (!productAttribute) {
    throw new Error(`Product ${product.id} has a variation attribute ${name} that the product does not list`);
  }
  return productAttribute;
}

function attributeFormField(productAttribute: ProductAttribute) {
  if (productAttribute.taxonomy === null) {
    return `attribute_${productAttribute.name.toLowerCase().replaceAll(" ", "-")}`;
  }
  return `attribute_${productAttribute.taxonomy}`;
}

function firstTermSlug(productAttribute: ProductAttribute) {
  const firstTerm = productAttribute.terms.at(0);
  if (!firstTerm) {
    throw new Error(`Attribute ${productAttribute.name} accepts any value but has no terms to send`);
  }
  return firstTerm.slug;
}

function termName(productAttribute: ProductAttribute, slug: string) {
  const term = productAttribute.terms.find((candidate) => candidate.slug === slug);
  if (!term) {
    return slug;
  }
  return term.name;
}

export function isOptionAvailable(picker: VariantPicker, selection: Selection, choiceName: string, value: string) {
  const earlierChoices = choicesBefore(picker, choiceName);
  return picker.variants.some((variant) => {
    if (!variant.inStock || variant.choiceValues[choiceName] !== value) {
      return false;
    }
    return earlierChoices.every((choice) => {
      const selectedValue = selection[choice.name];
      return selectedValue === undefined || selectedValue === variant.choiceValues[choice.name];
    });
  });
}

export function selectOption(picker: VariantPicker, selection: Selection, choiceName: string, value: string) {
  const nextSelection: Selection = { ...selection, [choiceName]: value };
  for (const choice of choicesAfter(picker, choiceName)) {
    const laterValue = nextSelection[choice.name];
    const isStillAvailable = laterValue !== undefined && isOptionAvailable(picker, nextSelection, choice.name, laterValue);
    if (!isStillAvailable) {
      delete nextSelection[choice.name];
    }
  }
  return nextSelection;
}

export function findSelectedVariant(picker: VariantPicker, selection: Selection) {
  return picker.variants.find((variant) =>
    picker.choices.every((choice) => selection[choice.name] === variant.choiceValues[choice.name]),
  );
}

export function initialSelection(picker: VariantPicker) {
  const selection: Selection = {};
  for (const choice of picker.choices) {
    const hasOnlyOneOption = choice.options.length === 1;
    if (hasOnlyOneOption) {
      selection[choice.name] = choice.options[0].value;
    }
  }
  return selection;
}

function choicesBefore(picker: VariantPicker, choiceName: string) {
  const choiceIndex = picker.choices.findIndex((choice) => choice.name === choiceName);
  return picker.choices.slice(0, choiceIndex);
}

function choicesAfter(picker: VariantPicker, choiceName: string) {
  const choiceIndex = picker.choices.findIndex((choice) => choice.name === choiceName);
  return picker.choices.slice(choiceIndex + 1);
}

export function compareSizes(first: string, second: string) {
  const firstLetterRank = LETTER_SIZES.indexOf(first.toUpperCase());
  const secondLetterRank = LETTER_SIZES.indexOf(second.toUpperCase());
  const bothAreLetterSizes = firstLetterRank !== -1 && secondLetterRank !== -1;
  if (bothAreLetterSizes) {
    return firstLetterRank - secondLetterRank;
  }
  return first.localeCompare(second, "pl", { numeric: true });
}
