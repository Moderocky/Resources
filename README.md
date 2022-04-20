Resources
=====

### Opus #17

This is the template for my web resources software, designed ByteSkript resources.

### Description

This displays resources, hosted on GitHub, in a pretty web format designed to resemble the common 'XenForo' resources marketplaces.

Most details are extracted directly from a GitHub repository via the GitHub API.
Octokit is set to auth using a token. Ideally, this will be a read-only token generated for the application.
However, this can be run without a token, but browsers will be capped at 60 requests per minute.

The average resource-load requires around ~10 requests to gather all the data about the user, contributors, releases and specific file contents (e.g. `README.md`.)

### Functionality

The key functionality is extracting and displaying the repository data.
Backend functionality is currently absent.

### Libraries Used
- Tailwind CSS 3 \
  The main display framework used is Tailwind, \
  with some additional custom CSS written for displaying markdown.
- FontAwesome v6 *(Free)* \
  Icons are provided by font awesome.
- Marked \
  The standard markdown-to-HTM converter.

My own DOM and request modules are also used.
