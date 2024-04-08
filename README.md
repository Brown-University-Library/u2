This project aims to digitize a series of recently declassified aerial photographs that document the Nile Delta and Nile Valley. Shot by U2 spy planes, this imagery provides much higher resolution images than any currently available imagery (for instance the CORONA satellite imagery that has revolutionized archaeology in this area in the past two decades), and shows the landscape prior to the construction of the Aswan High Dam.

Given the relatively early date of the imagery, there is excellent potential for site discovery and heritage mapping—these images provide an invaluable view of a landscape prior to the extensive expansion of agriculture and urban development in Egypt that, over the past six decades, has significantly altered the ability to see earlier material remains. For those archaeologists interested in landscape studies or tracing settlement patterns, these aerial photos have significant potential to offer valuable insights. For researchers seeking to identify damaged or threatened cultural heritage sites the U2 imagery will be a valuable tool to support a variety of research efforts across and beyond the Egyptological community.

Our aim is to make these images publicly available via a website that shows their location and how to download them from a digital repository. This project seeks to make these high resolution images free for any interested researchers and the general public.

# Specs

This site is built in Hugo. The development environment is at .brown.edu; to deploy updates on dev, push to the `dev` branch. The production environment is u2egypt.brown.edu; to deploy updates on prod, push to the `main` branch.

## Dependencies

The image comparison functionality is by https://github.com/cloudfour/image-compare. The map is built with Leaflet.

## Custom shortcodes

To embed a BDR item using Mirador, use the following shortcode:
```
{{< mirador "1234" >}}
```
where 1234 is the _numeric_ value for a BDR PID, e.g., the item at https://repository.library.brown.edu/studio/item/bdr:89322/ would be rendered with `{{< mirador "89322">}}`. Multiple Mirador embeds can be included in a given page.

To compate two images _of equal dimensions_:
```
{{< compare left="804now.jpg" right="804then.jpg" left-alt="Giza now" right-alt="Giza then" label="blah">}}
```
The shortcode assumes the images are page resources. Multiple image comparisons can be included in a given page.

# To-dos

- change dev BDR server URLs to prod
- get the flight path geojson working (need an origin point? or some way to relate the coordinates to their context)
