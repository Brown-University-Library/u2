+++
title = 'Timeline, 1959-10-30, Mission B8649'
date = 2024-08-01T12:51:19-04:00
draft = false
menu = "main"
+++
<dl class="timeline">
  <dt>7:13:50 AM</dt>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=1" alt=""></dd>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=2" alt=""></dd>
  <dd><img src="https://repository.library.brown.edu/iiif/image/bdr:mggnubq4/full/!180,100/0/default.jpg" alt=""></dd>
  <dt>7:13:56 AM</dt>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=3" alt=""></dd>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=4" alt=""></dd>
  <dd><img src="https://repository.library.brown.edu/iiif/image/bdr:f9tec8da/full/!180,100/0/default.jpg" alt=""></dd>
  <dt>7:14:02 AM</dt>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=5" alt=""></dd>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=6" alt=""></dd>
  <dd><img src="https://repository.library.brown.edu/iiif/image/bdr:kc28dgv2/full/!180,100/0/default.jpg" alt=""></dd>
  <dt>7:14:02 AM</dt>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=7" alt=""></dd>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=8" alt=""></dd>
  <dd><img src="https://repository.library.brown.edu/iiif/image/bdr:abyxrrgb/full/!180,100/0/default.jpg" alt=""></dd>
  <dt>7:14:14 AM</dt>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=9" alt=""></dd>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=10" alt=""></dd>
  <dd><img src="https://repository.library.brown.edu/iiif/image/bdr:q96ww4de/full/!180,100/0/default.jpg" alt=""></dd>
  <dt>7:14:20 AM</dt>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=11" alt=""></dd>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=12" alt=""></dd>
  <dd><img src="https://repository.library.brown.edu/iiif/image/bdr:njujxveu/full/!180,100/0/default.jpg" alt=""></dd>
  <dt>7:14:26 AM</dt>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=13" alt=""></dd>
  <dd><img src="https://picsum.photos/180/100?grayscale&blur=5&random=14" alt=""></dd>
  <dd><img src="https://repository.library.brown.edu/iiif/image/bdr:njujxveu/full/!180,100/0/default.jpg" alt=""></dd>
</dl>
Here's an example query that gets images from within a 1 hour period and returns their pid and timestamp (of course you could just leave the 'fl' flag off and return everything):
https://repository.library.brown.edu/api/search/?q=rel_is_member_of_collection_ssim:%22bdr:88np2gke%22%20AND%20timestamp:%5B2024-07-12T19:36:09.252Z%20TO%202024-07-12T20:36:09.252Z%5D&fl=pid,timestamp
