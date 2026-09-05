import sys
import urllib.request
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def test_api(url, data=None):
    req_data = json.dumps(data if data is not None else {}).encode('utf-8') if data is not None else None
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={'Content-Type': 'application/json'} if req_data else {}
    )
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode('utf-8'))

def main():
    print("=== 1. Root & Health Check ===")
    print(test_api('http://127.0.0.1:8000/'))

    print("\n=== 2. Seeded Products Check ===")
    prods = test_api('http://127.0.0.1:8000/api/products')
    print(f"Total products seeded: {len(prods)}")
    for p in prods[:4]:
        print(f" - {p['name']}: INR {p['price']} | Stock: {p['stock']} | Delivery: {p['delivery_days']} days")

    print("\n=== 3. Main Agent Scenario ===")
    res1 = test_api(
        'http://127.0.0.1:8000/api/agent/chat',
        {'prompt': 'I need running shoes under ₹5,000 for daily running and delivery within 3 days.'}
    )
    print("Session ID:", res1['session_id'])
    print("Selected product:", res1['selected_product']['name'])
    print("Order ID created:", res1['order_summary']['order_id'])
    print("Timeline steps count:", len(res1['timeline']))

    print("\n=== 4. Safety Demo (Policy Violation Enforcement) ===")
    res2 = test_api('http://127.0.0.1:8000/api/agent/test-policy-violation', {'discount_percentage': 20.0})
    timeline = res2['timeline']
    blocked_step = [s for s in timeline if s['status'] == 'blocked']
    print("Blocked step count:", len(blocked_step))
    if blocked_step:
        print("Policy Blocked Detail:", blocked_step[0]['detail'])

    print("\n=== 5. Failure Demo (Out-of-Stock Recovery) ===")
    res3 = test_api('http://127.0.0.1:8000/api/agent/test-out-of-stock', {})
    print("Out of stock product tested:", res3.get('out_of_stock_product_tested'))
    print("Recovered product selection:", res3['selected_product']['name'])

    print("\n=== 6. Audit Trail Log Verification ===")
    logs = test_api('http://127.0.0.1:8000/api/agent/audit-logs?limit=10')
    print(f"Audit log entries count: {len(logs)}")
    for l in logs[:6]:
        print(f" - [{l['decision']}] Agent: {l['agent']} | Action: {l['action']} | Reason: {l['reason']}")

if __name__ == '__main__':
    main()
