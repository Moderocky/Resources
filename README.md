Syzygy
=====

### Opus #17

This is the template for my web resources software, designed for ByteSkript resources.

### Description

This displays resources, hosted on GitHub, in a pretty web format designed to resemble the common 'XenForo' resources marketplaces.
Separate functionality, such as comments, reviews, votes and additional pages, are provided by the `node.js` backend layer.

Most details are extracted directly from a GitHub repository via the GitHub API.
Octokit is set to auth using a token. Ideally, this will be a read-only token generated for the application.
However, this can be run without a token, but browsers will be capped at 60 requests per minute.

The average resource-load will require around ~15 requests to gather all the data about the user, contributors, releases and specific file contents (e.g. `README.md`.)

User-information pages ought to be switched to lazy-loading given that they take the majority of the requests.

### Functionality

The key functionality is extracting and displaying the repository data.

The backend caches data for a total of two hours unless the content has changed, in which case it will be updated.
This should be sufficient to avoid the 5000/hour rate-limit of a standard GitHub token.

In the future, the browser will attempt direct requests first until the user's personal 60/hour rate-limit is exceeded.
This will reduce the load on the cache from bots and blithe (click-through) requests.

User accounts are handled entirely through GitHub, with no passwords or sensitive data stored.

### Local Libraries

**DOM**

A framework for document manipulation. \
This allows creating elements as direct objects from raw HTM with interspersed JavaScript. \
The framework also has a variable feature that inserts placeholders into their `{variable}` counterparts.
Functions will be evaluated straight away. Asynchronous functions will leave a blank space, and their value inserted into the element once the promise resolves.

### Libraries Used
- Tailwind CSS 3 \
  The main display framework used is Tailwind, \
  with some additional custom CSS written for displaying markdown.
- FontAwesome v6 *(Free)* \
  Icons are provided by font awesome.
- Marked \
  The standard markdown-to-HTM converter.
