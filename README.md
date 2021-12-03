
The latest version can be included in your player from this location: -

```
'https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/breadcrumb.js',
'https://files-manywho-com.s3.amazonaws.com/e1dbcceb-070c-4ce6-95b0-ba282aaf4f48/breadcrumb.css'
```

A running demo can be seen here: -

Coming Soon


A sharing token of that example flow is: -

Coming Soon


NOTE: Visibility based on page conditions is respected.



# Breadcrumb


## Functionality

Provides a clickable breadcrumb trail for navigation.

When an element is clicked it will store that element's value to the state then trigger an outcome named "OnClick" if attached to the component.

The component requires a path attribute as defined in the attributes section below.



## State

Set the state to a simple string field.

## Outcomes

A single outcome named "OnClick" can be attached to the component which will be triggered when a crumb is clicked.

## Attributes

### path

This provides the component with its configuration.

It should be given a JSON structure as its value in this format: -

```
{
    "label":"the text to display",
    "value":"the value to write into the state value when clicked",
    "child": {
        "label":"the text to display",
        "value":"the value to write into the state value when clicked",
        "child": {
            "label":"the last item's display"
        }
    }
}
```

The structure can be nested as far as required.

If an element has no value then it is not clickable.



