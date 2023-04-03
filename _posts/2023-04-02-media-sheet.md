---
layout: post
title:  "Media Sheet"
date:   2023-04-2 19:15:29 -0500
categories: tech
comments: false
permalink: /media-sheet
---

As a family, we love watching movies, and we have been doing it for quite some time. With so many movies, it was becoming challenging to keep track of what we have watched and what we haven't. Therefore, I decided to create a media sheet using OMDBAPI and Google Apps Scripts to have a database of all the movies we have watched as a family.

OMDBAPI is a free web service that allows you to access a massive database of movies, TV shows, and other media content. Google Apps Scripts, on the other hand, is a cloud-based scripting platform that provides you with a range of tools to automate and extend your Google Workspace applications.

To get started, I first created a Google Sheet where I would store all the information about the movies we have watched as a family. I added the following columns to the sheet:

```
Title: The title of the movie.
Year: The year the movie was released.
Actors: The names of the actors in the movie.
Plot: A brief summary of the movie.
Poster: A link to the movie's poster.
IMDBRating: IMDB's rating of the movie.
Runtime: Runtime of the movie.
Genre: The genre of the movie.
Language: Languages used in the movie.
Country: Country of origin of the movie.
```

I plan to the following in the near future-

```
Rating: Our rating of the movie
Watched on: The date we watched the movie
```

Next, I wrote a Google Apps Script that would use OMDBAPI to fetch information about the movie we wanted to add to the sheet. The script is triggerred on addition of a valid movie name in the first column of the sheet. Once the script retrieved the information, it would automatically populate the corresponding columns in the sheet. I have also added a stats page for some data-analysis. [You can find the source-code on my Github](https://github.com/janpreet/media-sheet).

Overall, this media sheet has been incredibly helpful in keeping track of all the movies we have watched as a family. We can now easily see which movies we have watched, and other related information. It has also made it easier to pick out movies to watch again or recommend to friends and family.

Here is the published spreadsheet, which is expected to sync with changes to the sheet. We've decided to share the list of movies we've watched and its statistics with the world 🙂

<div class="responsive-wrap">
    <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRTs9BY3dzDYfsRflRvISLwCByoLCOvCPqKLgUnxy2ItKyqvEpsiJMLNWCsucBCINt2ZOquccCOrm5z/pubhtml?widget=true&amp;headers=false" frameborder="0" width="960" height="569" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
</div>