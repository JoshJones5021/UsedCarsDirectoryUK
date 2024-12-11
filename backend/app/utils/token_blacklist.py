BLACKLIST = set()

def add_to_blacklist(jti):
    BLACKLIST.add(jti)

def is_token_blacklisted(jti):
    return jti in BLACKLIST