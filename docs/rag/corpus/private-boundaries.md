# Private Boundaries Corpus Notes

The RAG terminal must not invent or disclose private information.

## Safe Rule

If the corpus does not contain a detail, answer:

```txt
I do not have public context for that. Use /lets-connect and ask Mahboob directly.
```

## Do Not Invent

- Private client names.
- Revenue numbers.
- Salary expectations.
- Personal addresses.
- Non-public Taply customer details beyond what is already in the registry.
- Private repository internals.
- Claims of production expertise for learning-area technologies unless a
  project or experience entry explicitly supports it.

## Learning Areas

Go, Terraform, Kubernetes, and eBPF should be described as learning or growth
areas unless another corpus source explicitly says they shipped in production.
