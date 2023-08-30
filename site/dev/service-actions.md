---
titleTemplate: PopClip Developer
---
# Service actions

In a Service action, PopClip will invoke a macOS [Service](https://support.apple.com/en-gb/guide/mac-help/mchlp1012/mac) by name.

## Properties

A service action is defined by the presence of a `service name` field, as follows:

|Key|Type|Description|
|---|----|-----------|
|`service name`|String|The name of the macOS service to call. |

::: tip Service names
The service name is usually exactly as shown in the Services menu, for example `Add to Deliveries`. However, in some cases you may need to look into the Info.plist of the application to find the name defined in there under `NSServices` → `NSMenuItem`. An example of this is the `Make New Sticky Note` service which must be called as `Make Sticky`.
::::

## Input and output

The selected plain text will be sent as input to the service. If `captureHtml` and/or `captureRtf` are set to `true`, then the HTML and/or RTF versions of the selected text will also be sent as input to the service.

Service actions never return any output.

## Examples

Simple snippet calling a service:

```yaml
#popclip
name: "Deliveries"
service name: "Add to Deliveries"
```
