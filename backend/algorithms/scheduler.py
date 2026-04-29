def run_scheduling(jobs, algorithm='RR', quantum=2):
    if not jobs:
        return []

    results = []
    time_cursor = 0
    servers = ['Server-Alpha', 'Server-Beta', 'Server-Gamma', 'Server-Delta']

    if algorithm == 'FCFS':
        for i, job in enumerate(jobs):
            duration = job['duration_ms'] / 1000
            results.append({
                'job_id': job['id'],
                'job_name': job['name'],
                'server': servers[i % len(servers)],
                'start_time': round(time_cursor, 2),
                'end_time': round(time_cursor + duration, 2),
                'wait_time': round(time_cursor, 2),
                'turnaround': round(time_cursor + duration, 2),
                'algorithm': 'FCFS'
            })
            time_cursor += duration

    elif algorithm == 'SJF':
        sorted_jobs = sorted(jobs, key=lambda x: x['duration_ms'])
        for i, job in enumerate(sorted_jobs):
            duration = job['duration_ms'] / 1000
            results.append({
                'job_id': job['id'],
                'job_name': job['name'],
                'server': servers[i % len(servers)],
                'start_time': round(time_cursor, 2),
                'end_time': round(time_cursor + duration, 2),
                'wait_time': round(time_cursor, 2),
                'turnaround': round(time_cursor + duration, 2),
                'algorithm': 'SJF'
            })
            time_cursor += duration

    elif algorithm == 'Priority':
        sorted_jobs = sorted(jobs, key=lambda x: -x['priority'])
        for i, job in enumerate(sorted_jobs):
            duration = job['duration_ms'] / 1000
            results.append({
                'job_id': job['id'],
                'job_name': job['name'],
                'server': servers[i % len(servers)],
                'start_time': round(time_cursor, 2),
                'end_time': round(time_cursor + duration, 2),
                'wait_time': round(time_cursor, 2),
                'turnaround': round(time_cursor + duration, 2),
                'algorithm': 'Priority'
            })
            time_cursor += duration

    else:  # Round Robin
        job_list = [{'remaining': j['duration_ms'] / 1000, **j} for j in jobs]
        start_times = {j['id']: None for j in jobs}
        finished = []
        while job_list:
            job = job_list.pop(0)
            if start_times[job['id']] is None:
                start_times[job['id']] = time_cursor
            run = min(quantum, job['remaining'])
            end = time_cursor + run
            finished.append({
                'job_id': job['id'],
                'job_name': job['name'],
                'server': servers[job['id'] % len(servers)],
                'start_time': round(time_cursor, 2),
                'end_time': round(end, 2),
                'wait_time': round(start_times[job['id']], 2),
                'turnaround': round(end, 2),
                'algorithm': 'Round-Robin'
            })
            time_cursor = end
            job['remaining'] -= run
            if job['remaining'] > 0.001:
                job_list.append(job)
        results = finished

    return results
