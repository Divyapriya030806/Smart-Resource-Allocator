def greedy_allocate(job, servers):
    """
    Greedy Best-Fit allocator.
    Picks the server with enough capacity that wastes the least resources.
    """
    best = None
    best_score = float('inf')

    for s in servers:
        if s.status != 'active':
            continue
        remaining_cpu = s.cpu_capacity - s.current_cpu
        remaining_mem = s.mem_capacity - s.current_mem

        if remaining_cpu >= job.cpu_required and remaining_mem >= job.mem_required:
            waste = (remaining_cpu - job.cpu_required) + (remaining_mem - job.mem_required)
            score = waste / max(s.weight, 1)
            if score < best_score:
                best_score = score
                best = s

    if not best:
        return None

    remaining_cpu = best.cpu_capacity - best.current_cpu - job.cpu_required
    remaining_mem = best.mem_capacity - best.current_mem - job.mem_required

    return {
        "server_id": best.id,
        "server_name": best.name,
        "fit_score": round(best_score, 2),
        "remaining_cpu": round(remaining_cpu, 2),
        "remaining_mem": round(remaining_mem, 2),
        "algorithm": "Greedy Best-Fit Knapsack"
    }
