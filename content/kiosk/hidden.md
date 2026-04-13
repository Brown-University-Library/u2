+++
title = 'All photos'
date = 2026-04-13T12:16:03-04:00
draft = false
+++
This page is a source for all the photos exported from Kiosk so they are available to site-specific pages.

{{ range resources.ByType "image" }}
  <img src="{{ .RelPermalink }}" width="100" title="{{ .RelPermalink }}">
{{ end }}