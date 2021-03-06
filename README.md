# `samples` KBase UI Plugin

  > A kbase-ui plugin providing a viewer for samples

Similar to other viewer plugins (dataview, typeview), this plugin provides a ui endpoint for viewing and exploring samples.

## Usage

As a kbase-ui plugin, the sample landing page is invoked with a base of `https://ENV.kbase.us`, where `ENV` is the deployment environment such as `narrative` for production, and a path formed by the url fragment, commonly know as the _hash_ due to the usage of the `#` character to prefix it, the base of which is `#samples`

## Install

This plugin is a dependency of [kbase-ui](https://github.com/kbase/kbase-ui).

## Background

This plugin exists to provide an endpoint for inspecting a taxonomic reference.

## API

### General URL

The general form is:

```url
https://ENV.kbase.us#samples/view/ID[/VERSION]
```

where:

- `ENV` is the KBase deployment environment, `narrative`, `next`, `ci`, and others.
  - `taxonomy` is the dispatch name for the taxonomy plugin
- `taxon` indicates we want the taxon viewer
- `ID` is the sample id; the sample id is generated by KBase when the sample is imported into the system
- `VERSION` is an optional version; it is an integer. When a sample is updated, it is assigned a new version.

### URL Examples

The taxonomy landing page is meant to be linked to from other apps which expose a taxonomic assignment.

#### Current E. coli

```url
https://ci.kbase.us#samples#samples/view/bfe37f5b-2e3d-4d2c-84f4-7698fecb5352/1
```

## References

- kbase-ui
- sample service
- sample set data type

## License

SEE LICENSE IN LICENSE.md
