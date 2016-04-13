sna-saga
========

**Automated Social Network Analysis for HTML5**  
by _Krzysztof Jankowski and Antti Knutas_  
at _Lappeenranta University of Technology_

## Introduction
SAGA is an automated [social network analysis](http://en.wikipedia.org/wiki/Social_network_analysis) JavaScript web application. It parses and analyzes the social network of an online community. It visualizes the graph using the Vivagraph graphics library and provides centrality values for the community members.

### Motivation (i.e. why this thing exists)
This tool allows near real-time analysis and visualization of online social environments. We propose that with automated methods an instructor can better evaluate the evolving social dynamics of an online classroom and intervene if necessary. In our design, we have two major approaches: The analysis of the social network using mathematical methods, which is based on existing research on SNA, and the design of an automated analysis and visualization tool. In this tool we combine both of these approaches into one fully automated workflow that downloads, processes and visualizes the SNA results.

## Science!
You can see our previous publications about learning and gamification at our [publication list](http://www.codecamp.fi/doku.php/wiki/educational_technologies_centre?&#dept_of_innovation_software).
Also see the related publication in the [ACM Digital Library](http://dl.acm.org/citation.cfm?id=2812439).

## Compatibility
There is a data parser plugin available for the [Q2A](http://www.question2answer.org/) forum.

## Usage instructions
Set up a cron job to analyze logfiles from a desired source using an input plugin and copy the JSON results into a suitable directory. Use .htaccess or equivalent to control access to the data source and the page itself.

## Libraries and licenses
The web app uses the Vivagraph.JS ([LICENSE](https://raw.githubusercontent.com/anvaka/VivaGraphJS/master/LICENSE)), jQuery, ([LICENSE](https://jquery.org/license/)) and D3 ([LICENSE](https://raw.githubusercontent.com/mbostock/d3/master/LICENSE)) libraries. See their license information from previous links. This web app is available under the [GNU GPLv2](http://www.gnu.org/licenses/gpl-2.0.html) license. If you use it for something, we'd love to hear from you!

## Authors
Project by Antti Knutas and Krzysztof Jankowski, from the [Software & Innovation](http://www.lut.fi/web/en/school-of-business-and-management/research/innovation-and-software) department of Lappeenranta University of Technology.

If you link or refer to us, please link to our [project page](http://aknutas.github.io/sna-saga/).
