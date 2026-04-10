-- ============================================================
-- Migration: Expand difficulty scale from 1-5 to 1-10
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop the old constraint
ALTER TABLE nodes DROP CONSTRAINT IF EXISTS nodes_difficulty_check;

-- Step 2: Add new constraint allowing 1-10
ALTER TABLE nodes ADD CONSTRAINT nodes_difficulty_check CHECK (difficulty >= 1 AND difficulty <= 10);

-- Step 3: Remap existing node difficulty values
-- Work from highest to lowest to avoid conflicts
-- Old 5 → 8, 9, 10 (split by topic complexity)
-- Old 4 → 6, 7 (split by topic complexity)
-- Old 3 → 4, 5 (split by topic complexity)
-- Old 2 → 2, 3 (split by topic complexity)
-- Old 1 → 1 (stays the same)

-- ============================================================
-- MATH NODES REMAPPING
-- ============================================================

-- Math old D5 → D10 (Visionary)
UPDATE nodes SET difficulty = 10 WHERE slug IN ('category-theory') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D5 → D9 (Master)
UPDATE nodes SET difficulty = 9 WHERE slug IN ('measure-theory', 'functional-analysis', 'algebraic-topology') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D5 → D8 (Expert)
UPDATE nodes SET difficulty = 8 WHERE slug IN ('real-analysis', 'abstract-algebra', 'information-theory', 'game-theory', 'differential-geometry') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D4 → D7 (Advanced)
UPDATE nodes SET difficulty = 7 WHERE slug IN ('vector-calculus', 'partial-differential-equations', 'complex-analysis', 'group-theory', 'topology-intro', 'stochastic-processes', 'tensor-calculus') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D4 → D6 (Proficient)
UPDATE nodes SET difficulty = 6 WHERE slug IN ('differential-equations', 'multivariable-calculus', 'advanced-linear-algebra', 'fourier-analysis', 'numerical-methods', 'optimization-theory', 'bayesian-statistics') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D3 → D5 (Intermediate)
UPDATE nodes SET difficulty = 5 WHERE slug IN ('integration', 'polar-coordinates', 'parametric-equations', 'number-theory', 'graph-theory', 'probability-distributions') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D3 → D4 (Developing)
UPDATE nodes SET difficulty = 4 WHERE slug IN ('limits', 'derivatives', 'matrices', 'linear-systems', 'proof-techniques', 'conic-sections', 'statistics') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D2 → D3 (Foundational)
UPDATE nodes SET difficulty = 3 WHERE slug IN ('trigonometry', 'vectors', 'exponents-logarithms', 'sequences-series', 'complex-numbers', 'combinatorics', 'basic-probability') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'mathematics');

-- Math old D2 → D2 (Elementary) — these stay at 2
-- algebra, functions, inequalities, polynomials, sets-logic, coordinate-geometry already at 2

-- Math D1 stays at 1 — no change needed

-- ============================================================
-- PHYSICS NODES REMAPPING
-- ============================================================

-- Physics old D5 → D10 (Visionary)
UPDATE nodes SET difficulty = 10 WHERE slug IN ('string-theory', 'quantum-computing-physics') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D5 → D9 (Master)
UPDATE nodes SET difficulty = 9 WHERE slug IN ('general-relativity', 'quantum-field-theory', 'particle-physics', 'condensed-matter', 'cosmology') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D5 + old D4 → D8 (Expert)
UPDATE nodes SET difficulty = 8 WHERE slug IN ('quantum-mechanics', 'special-relativity', 'plasma-physics', 'astrophysics') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D4 → D7 (Advanced)
UPDATE nodes SET difficulty = 7 WHERE slug IN ('maxwells-equations', 'lagrangian-mechanics', 'hamiltonian-mechanics', 'statistical-mechanics', 'nuclear-physics', 'semiconductor-physics') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D4 → D6 (Proficient)
UPDATE nodes SET difficulty = 6 WHERE slug IN ('thermodynamics', 'electromagnetism', 'waves-oscillations', 'wave-optics', 'ac-circuits', 'atomic-structure') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D3 → D5 (Intermediate)
UPDATE nodes SET difficulty = 5 WHERE slug IN ('momentum', 'circular-motion', 'torque-rotation', 'fluid-mechanics', 'geometric-optics', 'electric-fields', 'magnetic-fields', 'collisions', 'gravitation') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D3 → D4 (Developing)
UPDATE nodes SET difficulty = 4 WHERE slug IN ('force', 'newtons-laws', 'energy', 'work-power', 'simple-harmonic-motion') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D2 → D3 (Foundational)
UPDATE nodes SET difficulty = 3 WHERE slug IN ('projectile-motion', 'electric-charge', 'dc-circuits', 'reflection-refraction', 'kinematic-equations') AND subject_id IN (SELECT id FROM subjects WHERE slug = 'physics');

-- Physics old D2 → D2 (Elementary) — these stay at 2
-- velocity, acceleration, gravity, friction, pressure, density-buoyancy, simple-machines already at 2

-- Physics D1 stays at 1 — no change needed

-- ============================================================
-- Verify the migration
-- ============================================================
SELECT difficulty, COUNT(*) as node_count 
FROM nodes 
GROUP BY difficulty 
ORDER BY difficulty;
