# Tags

Tags are there for states, categories, locations, etc. They can be used for all sorts of things and give the assets even more structure.

## Creating Tags

Creating tags is rather straight forward. They may have a parent tag and should have a descriptive name:

<img src="./assets/tag-create.png" />

## Hierarchical Tags

Just like [asset types](./asset-types.md), tags can be hierarchical. Nothing is inherited here, this is just to organize tags in a logical manner. For example, to say where an asset is located one may create a tag "Location" and all the different rooms assets could be in. The rooms are then assigned to the "Location" tag via the "Parent Tag" selector.

This also has another benefit. Asset types have a [field data type for "Tag"](./asset-types.md#data-types), that allows the user to select all the children of a specified parent tag. This way, the user gets a dropdown of the available rooms where the asset could be physically located.

<img src="./assets/tag-list.png" />
