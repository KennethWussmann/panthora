# Asset Types

Asset Types provide structure to assets. Given the diverse nature of assets Tory manages, defining Asset Types is crucial for specifying the kinds of assets to be stored and the fields they should possess.

For instance, food items and office electronics may require different fields and information.

## Creating an Asset Type

### Overview

<img src="./assets/asset-type-edit-basic-explanation-upper.png"/>

<table>
  <tr>
    <th>Number</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>1</td>
    <td>Specify the parent asset type for inheritance, as detailed in the <a href="#inheritance">Inheritance section</a>.</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Name of the asset type.</td>
  </tr>
</table>

### Custom Fields

Custom Fields act as a form builder, dictating which fields will be available when creating assets.

<img src="./assets/asset-type-edit-basic-explanation-lower.png"/>

<table>
  <tr>
    <th>Number</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>1</td>
    <td>Add a new custom field.</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Specify the data type of this field, referencing the <a href="#data-types">Data Types section</a>.</td>
  </tr>
  <tr>
    <td>3</td>
    <td>Field name. To include a name for assets, create a custom field titled "Name".</td>
  </tr>
  <tr>
    <td>4</td>
    <td>Marking a field as required makes it mandatory for asset type creation.</td>
  </tr>
  <tr>
    <td>5</td>
    <td>"Show in table" adds the field as a column in the asset table, aiding asset identification.</td>
  </tr>
  <tr>
    <td>6</td>
    <td>The minimum length requirement varies by data type, ensuring at least 3 characters for strings.</td>
  </tr>
  <tr>
    <td>7</td>
    <td>The maximum length limit, with no value allowing an infinite character count.</td>
  </tr>
  <tr>
    <td>8</td>
    <td>Field order in asset creation can be adjusted via drag and drop.</td>
  </tr>
  <tr>
    <td>9</td>
    <td>Fields can be removed, which also deletes data from assets containing these fields.</td>
  </tr>
</table>

#### Data Types

<table>
  <tr>
    <th>Data Type</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>String</td>
    <td>Single line input for any text, not suitable for numerical calculations.</td>
  </tr>
  <tr>
    <td>Number</td>
    <td>Accepts only numerical values, ensuring controlled input.</td>
  </tr>
  <tr>
    <td>Boolean</td>
    <td>Renders as a toggle switch, useful for binary states such as "Required".</td>
  </tr>
  <tr>
    <td>Date</td>
    <td>Includes a date picker for easy date selection.</td>
  </tr>
  <tr>
    <td>Tag</td>
    <td>Selection field for tags, facilitating asset categorization. Parent tag selection enables hierarchical tag usage. Further details in <a href="./tags.md">Tags documentation</a>.</td>
  </tr>
</table>

## Inheritance

Asset Types can inherit fields from a parent, streamlining the creation of related asset types without duplicating custom fields.

### Example

<img src="./assets/asset-type-list.png" />

The "Root" asset type includes a "Name" field, inherited by both "Electronics" and "Food". This inheritance ensures that creating an asset under "Food" automatically includes the "Name" field, even if not explicitly defined within the "Food" asset type.
