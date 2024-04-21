import { type ImportSchema } from "~/server/lib/import/importSchema";

const seed: ImportSchema = {
  $schema: "https://panthora.app/import-0.3.0.schema.json",
  name: "Food Tracker Inventory",
  version: "1.0.0",
  description:
    "Manage and track various food items stored in different locations such as the fridge, pantry, or when they are out of stock.",
  author: "Panthora AI",
  tags: [
    {
      id: "location",
      name: "Location",
      children: [
        {
          id: "fridge",
          name: "Fridge",
        },
        {
          id: "pantry",
          name: "Pantry",
        },
        {
          id: "out_of_stock",
          name: "Out of Stock",
        },
      ],
    },
  ],
  assetTypes: [
    {
      id: "food_item",
      name: "Food Item",
      fields: [
        {
          id: "name",
          type: "STRING",
          name: "Name",
          inputRequired: true,
          showInTable: true,
        },
        {
          id: "amount",
          type: "NUMBER",
          name: "Amount",
          inputRequired: true,
          showInTable: true,
        },
        {
          id: "location",
          type: "TAG",
          parentTagId: "location",
          name: "Location",
          inputRequired: true,
          showInTable: true,
        },
      ],
    },
  ],
  assets: [
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Milk, 1L",
        },
        {
          fieldId: "amount",
          value: 2,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Eggs, 12pcs",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Butter, 250g",
        },
        {
          fieldId: "amount",
          value: 3,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Cheddar Cheese, 200g",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Whole Wheat Bread, 1 loaf",
        },
        {
          fieldId: "amount",
          value: 2,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Pasta, 500g",
        },
        {
          fieldId: "amount",
          value: 4,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Tomato Sauce, 300g",
        },
        {
          fieldId: "amount",
          value: 3,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Olive Oil, 1L",
        },

        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Chicken Breast, 1kg",
        },
        {
          fieldId: "amount",
          value: 2,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Beef Steak, 500g",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Salmon Fillet, 500g",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Yogurt, 200g x 6",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Canned Beans, 400g",
        },
        {
          fieldId: "amount",
          value: 5,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Rice, 1kg",
        },
        {
          fieldId: "amount",
          value: 3,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Honey, 500g",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Apple Juice, 1L",
        },
        {
          fieldId: "amount",
          value: 2,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Orange Juice, 1L",
        },
        {
          fieldId: "amount",
          value: 2,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Sparkling Water, 500ml x 6",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["fridge"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Chocolate, 100g",
        },
        {
          fieldId: "amount",
          value: 4,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Granola Bars, 40g x 5",
        },
        {
          fieldId: "amount",
          value: 3,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
    {
      assetTypeId: "food_item",
      values: [
        {
          fieldId: "name",
          value: "Spices Set, 10 types",
        },
        {
          fieldId: "amount",
          value: 1,
        },
        {
          fieldId: "location",
          value: ["pantry"],
        },
      ],
    },
  ],
};

export default seed;
