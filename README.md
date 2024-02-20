<div align="center">
  <h1><code>tory</code></h1>
  <p>
    <strong>Simple and light-weight inventory system for literally anything</strong>
  </p>
</div>

## Features

- [x] Keep track of all your items
- [x] Print customizable labels for your items
- [x] Collaborate on your inventory
- [x] Single sign-on

## Getting Started

> [!NOTE]  
> Tory is still in a pre-release phase, use with caution.

See the [hosting docs](./docs/hosting/) to deploy your instance today.

## Meet tory

Existing inventory systems either enforce heavy bureaucracy and overhead onto their users. Which may be great for professional use-cases, but if simple personal use-cases this more work, less flexible and way to overpowered.

The idea of tory is, to allow users to create their own workflow to create and manage their assets. This is accomplished by using only three concepts that can handle a lot of different requirements at once.

### Tags

Tags can be added to assets. They can be hierarchical to establish your very own structure.

### Asset Types

Asset types are the blueprint for everything you want to inventorize. They can be hierarchical as well and allow to group different kinds of asset types.

They can have and inherit custom input fields that can be configured to the user's needs.

This way a food item could have different set of fields than electronics.

### Assets

Assets are the parts and items you want to store in your inventory. They use one Asset Type to determine all the fields that should be filled.
