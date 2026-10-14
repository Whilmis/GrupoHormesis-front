with open("src/pages/portal/admin/AdminCalendars.tsx", "r", encoding="utf-8") as f:
    ts = f.read()

# Replace the malformed ending
bad_end = """      )}
    </div>
  );
}    </>
  );
}"""

good_end = """      )}
    </div>
    </>
  );
}"""

ts = ts.replace(bad_end, good_end)

with open("src/pages/portal/admin/AdminCalendars.tsx", "w", encoding="utf-8") as f:
    f.write(ts)
print("Fixed syntax error")
