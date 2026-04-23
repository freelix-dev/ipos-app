
import sqlite3

def check_db():
    conn = sqlite3.connect('/Users/ehmixai/Library/Developer/CoreSimulator/Devices/C60D2D2D-5F6D-4D4F-86B5-6D4D4F86B56D/data/Documents/ipos_database.db') # This path might be wrong, I need to find the real one
    # Actually I'll just use a more generic way if I can.
    # But I don't know the simulator ID.
    pass

# I'll just list the files in the Documents directory to find the db
