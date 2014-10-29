sna-saga
========

Automated Social Network Analysis for HTML5

## Introduction
SAGA is an automated [social network analysis](http://en.wikipedia.org/wiki/Social_network_analysis) JavaScript web application. It parses and analyzes the social network of an online community. It visualizes the graph using the Vivagraph graphics library and provides centrality values for the community members.

## Compatibility
There is a data parser plugin available for the [Q2A](http://www.question2answer.org/) forum.

## Usage instructions
Set up a cron job to analyze logfiles from a desired source using an input plugin and copy the JSON results into a suitable directory. Use .htaccess or equivalent to control access to the data source and the page itself.

## Libraries and licenses
The web app uses the Vivagraph.JS ([LICENSE](https://raw.githubusercontent.com/anvaka/VivaGraphJS/master/LICENSE)), jQuery, ([LICENSE](https://jquery.org/license/)) and D3 ([LICENSE](https://raw.githubusercontent.com/mbostock/d3/master/LICENSE)) libraries. See their license information from previous links. This web app is available under the [GNU GPLv2](http://www.gnu.org/licenses/gpl-2.0.html) license. If you do use it for something, we'd love to hear from you!

## Authors
Project by Antti Knutas and Krzysztof Jankowski, from the [Software Engineering and Information Management](http://www.lut.fi/web/en/school-of-industrial-engineering-and-management/software-engineering-and-information-management) department of Lappeenranta University of Technology.
