---
layout: post
title:  "Kado Proxy"
date:   2024-08-12 20:15:29 -0500
categories: tech
comments: false
permalink: /kado-proxy
---

Hello :), nother night, another tale from the trenches of late-night programming that'll make you laugh, cry, and maybe reach for your debugger.

Picture this: It's the late hours of the night, the house is peacefully quiet, and I'm basking in the soft glow of my monitor. No, I'm not fueled by coffee – my energy comes from a much more powerful source. Just down the hall, my little one is sleeping soundly, blissfully unaware that her dad is on a mission to make her future brighter, one line of code at a time.

## The Kado-Proxy Chronicles: When Tests Rebel

So there I am, working on my latest project, [kado-proxy](https://github.com/janpreet/kado-proxy), feeling pretty good about life. My amazing wife has encouraged me to invest in upskilling, and I'm determined to make the most of this opportunity. But then, oh boy, the tests decided to throw a party – and not the fun kind!

### The Case of the Disappearing Token in TestGetInstallationToken

First up, our sneaky `TestGetInstallationToken` decided to play hide and seek. It's supposed to fetch a nice little "test-token", but instead? Poof! Gone! Vanished into thin air like my free time since becoming a parent. I mean, come on! Where'd you go, little token?

Here's the culprit test function:

```go
func TestGetInstallationToken(t *testing.T) {
	mockClient := new(mockHTTPClient)

	mockResponse := &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(bytes.NewBufferString(`{"token": "test-token"}`)),
	}
	mockClient.On("Do", mock.Anything).Return(mockResponse, nil)

	token, err := GetInstallationToken(mockClient, "test-url", "test-app-id", "test-installation-id", "test-private-key")
	if err != nil {
		t.Errorf("Received unexpected error: %v", err)
	}
	if token != "test-token" {
		t.Errorf("expected: %s, actual: %s", "test-token", token)
	}
}
```

### TestHandleRequest: A Comedy of Errors

Next, `TestHandleRequest` joined the rebellion with its own brand of chaos. It's sitting there, expecting a well-behaved 200 or maybe a cheeky little 429, but what does it get? A big fat 500 error. Talk about a plot twist!

Here's what the mischievous test looked like:

```go
func TestHandleRequest(t *testing.T) {
	config := &Config{
		GithubAppID:    "test-app-id",
		GithubAppKey:   []byte("test-private-key"),
		InstallationID: 12345,
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()

	handler := HandleRequest(config)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected: %v, actual: %v", http.StatusOK, status)
	}

	expected := "token "
	if !strings.Contains(rr.Body.String(), expected) {
		t.Errorf("expected body to contain %q, got %q", expected, rr.Body.String())
	}
}
```

### TestModifyResponse: The Rate Limit Tango

And just when I thought things couldn't get any weirder, `TestModifyResponse` decided to crash the party with a rate limit reach. There I was, minding my own business, when suddenly – rate limit hit.

## Trimming Down the Tests and Building for the Future

After wrangling with these rebellious tests, I decided it was time to trim down and streamline. I removed some of the less critical tests to focus on what really matters. But don’t worry – I’m not done yet. I’m continuously adding more comprehensive tests to future-proof this project. The journey to test perfection is a marathon, not a sprint.

## A Detailed README for Integration Success

One thing I'm particularly proud of is the detailed README I’ve put together. It’s got everything you need to seamlessly integrate kado-proxy into your project, especially if you’re dealing ith rate-limiting on GitHub. Whether you’re a seasoned developer or a curious newcomer, this README will guide you every step of the way :)

## The Why Behind the Code

You know, in these quiet hours, with the gentle hum of the computer fan and the occasional sleepy mumble from the baby, it hits me. This isn't just about fixing bugs or passing tests. It's about building something meaningful, creating a future where my little one can look at me and say, "Wow, papa, you really did that?"

And let's be real – none of this would be possible without my incredible support system. My wife, who not only encourages these late-night coding sessions but also somehow manages to not roll her eyes (too much) when I start babbling about Go routines over breakfast.

## The Moral of the Story

At the end of the night, as I finally crawl into bed, I realize something. These debugging adventures, these late-night battles with stubborn tests – they're not just about improving my skills. They're about perseverance, problem-solving, and the kind of dedication I hope to instill in my child.

So here's to the bugs that keep us on our toes, the tests that make us question our sanity, and the sweet, sweet victory when everything finally turns green. But most of all, here's to the little ones who inspire us to be better, do better, and code better!!
