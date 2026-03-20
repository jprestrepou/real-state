import sys

filepath = r"c:\Users\jupa_\Desktop\proyecto real state\pms-backend\app\services\budget_service.py"
with open(filepath, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update _refresh_budget_totals
s1 = """    query = select(Transaction.category, sa_func.coalesce(sa_func.sum(Transaction.amount), 0.0)).where("""
r1 = """    query = select(Transaction.budget_category_id, Transaction.category, sa_func.coalesce(sa_func.sum(Transaction.amount), 0.0)).where("""
code = code.replace(s1, r1)

s2 = """    query = query.group_by(Transaction.category)
    result = await db.execute(query)
    results = result.all()
    
    # Map category names to their sums
    cat_actuals = {row[0].lower(): float(row[1]) for row in results}
    
    total_exec = 0.0
    total_budget_sum = 0.0

    for cat in budget.categories:
        total_budget_sum += float(cat.budgeted_amount)
        
        # Match transaction categories to budget categories (using search logic)
        cat_search_terms = {cat.category_name.lower()}
        lower_cat = cat.category_name.lower()
        if "mantenimiento" in lower_cat:
            cat_search_terms.update(["gastos mantenimiento", "mantenimiento general", "mantenimiento"])
        elif "administracion" in lower_cat or "administración" in lower_cat:
            cat_search_terms.update(["cuotas de administración", "gastos administrativos", "honorarios gestión"])
        elif "servicio" in lower_cat:
            cat_search_terms.add("servicios públicos")
        
        cat_actual = 0.0
        for term in cat_search_terms:
            cat_actual += cat_actuals.get(term, 0.0)"""

r2 = """    query = query.group_by(Transaction.budget_category_id, Transaction.category)
    result = await db.execute(query)
    results = result.all()
    
    cat_actuals_by_id = {}
    cat_actuals_by_text = {}
    for row in results:
        b_id = row[0]
        c_name = row[1].lower() if row[1] else ""
        amount = float(row[2])
        if b_id:
            cat_actuals_by_id[b_id] = cat_actuals_by_id.get(b_id, 0.0) + amount
        else:
            cat_actuals_by_text[c_name] = cat_actuals_by_text.get(c_name, 0.0) + amount
    
    total_exec = 0.0
    total_budget_sum = 0.0

    for cat in budget.categories:
        total_budget_sum += float(cat.budgeted_amount)
        
        cat_search_terms = {cat.category_name.lower()}
        lower_cat = cat.category_name.lower()
        if "mantenimiento" in lower_cat:
            cat_search_terms.update(["gastos mantenimiento", "mantenimiento general", "mantenimiento"])
        elif "administracion" in lower_cat or "administración" in lower_cat:
            cat_search_terms.update(["cuotas de administración", "gastos administrativos", "honorarios gestión"])
        elif "servicio" in lower_cat:
            cat_search_terms.add("servicios públicos")
        
        cat_actual = cat_actuals_by_id.get(cat.id, 0.0)
        for term in cat_search_terms:
            cat_actual += cat_actuals_by_text.get(term, 0.0)"""
code = code.replace(s2, r2)
if s2 not in code and r2 not in code: print("Failed 2")


# 2. Update get_budget_vs_actual_report
s3 = """        trans_stmt = select(func.sum(Transaction.amount)).where(
            and_(
                Transaction.category.in_(cat_search_terms),"""
r3 = """        from sqlalchemy import or_
        trans_stmt = select(func.sum(Transaction.amount)).where(
            and_(
                or_(
                    Transaction.budget_category_id == cat.id,
                    and_(
                        Transaction.budget_category_id == None,
                        Transaction.category.in_(cat_search_terms)
                    )
                ),"""
code = code.replace(s3, r3)

# 3. Update get_budget_monthly_breakdown
s4 = """            trans_stmt = select(func.sum(Transaction.amount)).where(
                and_(
                    func.lower(Transaction.category).in_(cat_search_terms),"""
r4 = """            from sqlalchemy import or_
            trans_stmt = select(func.sum(Transaction.amount)).where(
                and_(
                    or_(
                        Transaction.budget_category_id == cat.id,
                        and_(
                            Transaction.budget_category_id == None,
                            func.lower(Transaction.category).in_(cat_search_terms)
                        )
                    ),"""
code = code.replace(s4, r4)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(code)

print("Budget service upgraded")
