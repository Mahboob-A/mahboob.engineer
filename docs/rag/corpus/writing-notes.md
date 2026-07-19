# Writing Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for richer summaries / take-aways of writing than
> the registry's `excerpt` already provides.

## Recommendation Rules

When someone asks "what should I read on your Medium first," the answer
depends on the question. **Docker and networking internals** — the Linux
Networking series (parts 1–4) is the single best starting point. **Queues
and async architecture** — Message Queue 101 explains RabbitMQ; the
Algocode deep-dive shows how a real microservice split uses it. **SQL
fundamentals** — the PostgreSQL series parts 1–3 covers setup, joins, and
aggregation. **High-availability caching** — Redis HA parts 1 and 2 covers
replication, sentinels, and a fault-tolerant cluster. **AWS networking
basics** — AWS Networking 101 covers VPCs, subnets, security groups, and
the bastion pattern. **Building a real distributed backend** — Algocode
deep-dive is the most-cited piece on the channel.

## Per-Post Notes

### Linux Networking for Backend Engineers, Part 1

The opening of a four-part kernel primer. If you've ever wondered why
Docker networking feels like magic, this is the post that walks through
namespaces, veth pairs, and bridges in order. I wrote it because almost
every "this container can't reach the other container" bug I've debugged
came back to one of these three concepts being misunderstood.

### Linux Networking for Backend Engineers, Part 2

Namespaces don't actually talk to each other by magic — they talk via veth
pairs. The post walks through packet flow inside Docker's bridge
networking and shows where the routing decisions happen. The mental model
in here is what I'd want every SRE and DevOps person to share.

### Linux Networking for Backend Engineers, Part 3

The third post covers bridges, default gateways, and the one-way outbound
path every container uses when reaching for the internet. I wrote this
one specifically because part 2 left people confused about how a packet
that starts inside a namespace reaches a public IP at all.

### Linux Networking for Backend Engineers, Part 4

The last mile. Source NAT (MASQUERADE) and packet forwarding complete the
loop so a namespace can hit the public internet. This one closes the
loop on the four-part series and is the one to read if you only have
time for one.

### PostgreSQL Part 1

The first of three Postgres primers. It covers getting Postgres running,
how to think about tables that scale beyond a toy schema, and CRUD that
doesn't fall apart when the index hits 10M rows. I wrote it because most
"Postgres tutorials" skip the part where your schemas interact with
deployment realities.

### PostgreSQL Part 2

Joins. INNER, LEFT, RIGHT, FULL, and what each one actually means before
the planner rewrites your query into something different. The mental
model I wish I'd had on day one — the planner is doing real work, and
understanding how it rewrites your query makes you a much better SQL
author.

### PostgreSQL Part 3

GROUP BY, HAVING, and the mental model that makes aggregation queries feel
obvious. If you've ever copy-pasted a SQL aggregation from Stack Overflow
hoping for the best, this is the post that turns that into something you
can actually reason about.

### Redis HA Part 1

Replication, sentinels, and the failure modes you actually have to design
for when Redis is on the request path. The mental model in part 1 is what
I'd want every backend engineer who's about to use Redis in production to
absorb before they pick a topology.

### Redis HA Part 2

From a single EC2 to a fault-tolerant Redis Cluster. This is the post that
turns the part 1 mental model into a real production deployment. The
practical glue that the docs assume you already have — health-check
failover, rolling upgrades, key migration.

### AWS Networking 101

A practical first step into AWS networking. VPCs, subnets, security groups,
and the bastion pattern explained hands-on. The post that the Pulumi AWS
Infra project on this portfolio cites as the pre-read. If you're about
to ship your first production AWS environment, read this first.

### Building a LeetCode Online Judge (Algocode)

The full story behind Algocode. Microservice boundaries, RabbitMQ
coordination, and running untrusted code safely inside sibling Docker
containers. The post is the public version of the Algocode deep-dive
case study on this portfolio and is what I'd send someone who's about
to design a code-judge or a sandbox-of-arbitrary-user-code.

### Message Queue 101 (Medium cross-post)

RabbitMQ from first principles. Why Algocode needed a message queue, how
exchanges and queues actually work, and the mental model that made it
click. The cross-post version of the canonical Message Queue 101 piece,
aimed at readers who've used queues before but never understood why
RabbitMQ's design is the way it is.

### DrishtiAI Eye Screening Agent

Building a real-time AI eye-screening pipeline for rural India over
WebRTC. Agent architecture, queue design, and the constraints that shaped
every decision. The post that ties the DrishtiAI project to a real
problem (12M blind in India, 80% preventable) and walks through the 5-
layer CV pipeline under a 7-day build clock.

### Linux Networking for Backend Engineers, Part 1 (canonical)

Same content as the Medium cross-post, kept on the canonical channel for
search discoverability. Worth reading whichever version Medium surfaces.

### Message Queue 101 (canonical)

The canonical, longer version of the Message Queue 101 series. I wrote
this one first; the Medium cross-post is a tighter, reader-focused
summary. Read this one if you want the deeper mental model — RabbitMQ's
flow control, dead-letter queues, and the Ack patterns that survive a
consumer crash.

### Algocode Deep Dive

The full build story behind Algocode. Splitting a judge into three
independently deployable services, coordinating through RabbitMQ, and
running untrusted C++ inside sibling Docker containers with Linux
namespaces + cgroups + seccomp enforcing hard resource limits. The post
that pulls together distributed systems, kernel primitives, and real
microservice deployment. If you read one post on this portfolio, read
this one.
