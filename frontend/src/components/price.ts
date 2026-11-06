const formerPriceClassName =
  "[&_del]:text-mute [&_del_.amount]:text-small [&_del_.amount]:font-normal [&_del_.amount]:text-mute [&_br~del]:hidden";

export const priceClassName = `tabular-nums [&_.amount]:block [&_.amount]:text-small [&_.amount]:text-mute [&_.amount--netto]:text-body [&_.amount--netto]:font-semibold [&_.amount--netto]:text-ink [&_br]:hidden [&_small]:[font-size:inherit] ${formerPriceClassName}`;

export const productPagePriceClassName = `tabular-nums [&_.amount]:block [&_.amount]:text-small [&_.amount]:text-mute [&_.amount--netto]:text-title [&_.amount--netto]:font-bold [&_.amount--netto]:text-ink [&_br]:hidden [&_small]:[font-size:inherit] ${formerPriceClassName}`;
