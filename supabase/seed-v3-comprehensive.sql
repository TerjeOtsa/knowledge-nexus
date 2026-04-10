-- =============================================
-- Knowledge Nexus - Comprehensive Seed Data v3
-- ~120 nodes: ~60 Math + ~60 Physics
-- Full spider-web of connections
-- =============================================

-- Clear existing data (in dependency order)
TRUNCATE mastery_question_options, mastery_questions, mastery_tests,
         mastery_attempts, user_node_progress,
         prerequisites, edges, nodes, subjects
CASCADE;

DO $$
DECLARE
  -- ======== SUBJECTS ========
  v_sub_math UUID := uuid_generate_v4();
  v_sub_physics UUID := uuid_generate_v4();

  -- ======================================================================
  -- MATH NODES (~60 nodes)
  -- ======================================================================

  -- ---- Difficulty 1 — Beginner (absolute basics) ----
  v_basic_arithmetic UUID := uuid_generate_v4();
  v_fractions UUID := uuid_generate_v4();
  v_decimals_percentages UUID := uuid_generate_v4();
  v_basic_geometry UUID := uuid_generate_v4();
  v_number_line UUID := uuid_generate_v4();
  v_order_of_operations UUID := uuid_generate_v4();
  v_ratios_proportions UUID := uuid_generate_v4();

  -- ---- Difficulty 2 — Elementary ----
  v_algebra UUID := uuid_generate_v4();
  v_functions UUID := uuid_generate_v4();
  v_inequalities UUID := uuid_generate_v4();
  v_polynomials UUID := uuid_generate_v4();
  v_sets_logic UUID := uuid_generate_v4();
  v_coordinate_geometry UUID := uuid_generate_v4();

  -- ---- Difficulty 3 — Foundational ----
  v_trigonometry UUID := uuid_generate_v4();
  v_vectors UUID := uuid_generate_v4();
  v_exponents_logarithms UUID := uuid_generate_v4();
  v_sequences_series UUID := uuid_generate_v4();
  v_complex_numbers UUID := uuid_generate_v4();
  v_combinatorics UUID := uuid_generate_v4();
  v_basic_probability UUID := uuid_generate_v4();

  -- ---- Difficulty 4 — Developing ----
  v_limits UUID := uuid_generate_v4();
  v_derivatives UUID := uuid_generate_v4();
  v_matrices UUID := uuid_generate_v4();
  v_linear_systems UUID := uuid_generate_v4();
  v_proof_techniques UUID := uuid_generate_v4();
  v_conic_sections UUID := uuid_generate_v4();
  v_statistics UUID := uuid_generate_v4();

  -- ---- Difficulty 5 — Intermediate ----
  v_integration UUID := uuid_generate_v4();
  v_polar_coordinates UUID := uuid_generate_v4();
  v_parametric_equations UUID := uuid_generate_v4();
  v_number_theory UUID := uuid_generate_v4();
  v_graph_theory UUID := uuid_generate_v4();
  v_probability_distributions UUID := uuid_generate_v4();

  -- ---- Difficulty 6 — Proficient ----
  v_differential_eq UUID := uuid_generate_v4();
  v_multivariable_calc UUID := uuid_generate_v4();
  v_linear_algebra UUID := uuid_generate_v4();
  v_fourier_analysis UUID := uuid_generate_v4();
  v_numerical_methods UUID := uuid_generate_v4();
  v_optimization UUID := uuid_generate_v4();
  v_bayesian_statistics UUID := uuid_generate_v4();

  -- ---- Difficulty 7 — Advanced ----
  v_vector_calculus UUID := uuid_generate_v4();
  v_partial_diff_eq UUID := uuid_generate_v4();
  v_complex_analysis UUID := uuid_generate_v4();
  v_group_theory UUID := uuid_generate_v4();
  v_topology_intro UUID := uuid_generate_v4();
  v_stochastic_processes UUID := uuid_generate_v4();
  v_tensor_calculus UUID := uuid_generate_v4();

  -- ---- Difficulty 8 — Expert ----
  v_real_analysis UUID := uuid_generate_v4();
  v_abstract_algebra UUID := uuid_generate_v4();
  v_information_theory UUID := uuid_generate_v4();
  v_game_theory UUID := uuid_generate_v4();
  v_differential_geometry UUID := uuid_generate_v4();

  -- ---- Difficulty 9 — Master ----
  v_measure_theory UUID := uuid_generate_v4();
  v_functional_analysis UUID := uuid_generate_v4();
  v_algebraic_topology UUID := uuid_generate_v4();

  -- ---- Difficulty 10 — Visionary ----
  v_category_theory UUID := uuid_generate_v4();

  -- ======================================================================
  -- PHYSICS NODES (~60 nodes)
  -- ======================================================================

  -- ---- Difficulty 1 — Beginner ----
  v_measurement UUID := uuid_generate_v4();
  v_basic_motion UUID := uuid_generate_v4();
  v_states_of_matter UUID := uuid_generate_v4();
  v_temperature_heat UUID := uuid_generate_v4();
  v_basic_electricity UUID := uuid_generate_v4();
  v_light_basics UUID := uuid_generate_v4();
  v_sound_basics UUID := uuid_generate_v4();

  -- ---- Difficulty 2 — Elementary ----
  v_velocity UUID := uuid_generate_v4();
  v_acceleration UUID := uuid_generate_v4();
  v_gravity UUID := uuid_generate_v4();
  v_friction UUID := uuid_generate_v4();
  v_pressure UUID := uuid_generate_v4();
  v_density_buoyancy UUID := uuid_generate_v4();
  v_simple_machines UUID := uuid_generate_v4();

  -- ---- Difficulty 3 — Foundational ----
  v_projectile_motion UUID := uuid_generate_v4();
  v_electric_charge UUID := uuid_generate_v4();
  v_dc_circuits UUID := uuid_generate_v4();
  v_reflection_refraction UUID := uuid_generate_v4();
  v_kinematic_equations UUID := uuid_generate_v4();

  -- ---- Difficulty 4 — Developing ----
  v_force UUID := uuid_generate_v4();
  v_newtons_laws UUID := uuid_generate_v4();
  v_energy UUID := uuid_generate_v4();
  v_work_power UUID := uuid_generate_v4();
  v_simple_harmonic UUID := uuid_generate_v4();

  -- ---- Difficulty 5 — Intermediate ----
  v_momentum UUID := uuid_generate_v4();
  v_circular_motion UUID := uuid_generate_v4();
  v_torque_rotation UUID := uuid_generate_v4();
  v_fluid_mechanics UUID := uuid_generate_v4();
  v_geometric_optics UUID := uuid_generate_v4();
  v_electric_fields UUID := uuid_generate_v4();
  v_magnetic_fields UUID := uuid_generate_v4();
  v_collisions UUID := uuid_generate_v4();
  v_gravitation UUID := uuid_generate_v4();

  -- ---- Difficulty 6 — Proficient ----
  v_thermodynamics UUID := uuid_generate_v4();
  v_electromagnetism UUID := uuid_generate_v4();
  v_waves UUID := uuid_generate_v4();
  v_wave_optics UUID := uuid_generate_v4();
  v_ac_circuits UUID := uuid_generate_v4();
  v_atomic_structure UUID := uuid_generate_v4();

  -- ---- Difficulty 7 — Advanced ----
  v_maxwells_equations UUID := uuid_generate_v4();
  v_lagrangian_mechanics UUID := uuid_generate_v4();
  v_hamiltonian_mechanics UUID := uuid_generate_v4();
  v_statistical_mechanics UUID := uuid_generate_v4();
  v_nuclear_physics UUID := uuid_generate_v4();
  v_semiconductor_physics UUID := uuid_generate_v4();

  -- ---- Difficulty 8 — Expert ----
  v_quantum_intro UUID := uuid_generate_v4();
  v_special_relativity UUID := uuid_generate_v4();
  v_plasma_physics UUID := uuid_generate_v4();
  v_astrophysics UUID := uuid_generate_v4();

  -- ---- Difficulty 9 — Master ----
  v_general_relativity UUID := uuid_generate_v4();
  v_quantum_field_theory UUID := uuid_generate_v4();
  v_particle_physics UUID := uuid_generate_v4();
  v_condensed_matter UUID := uuid_generate_v4();
  v_cosmology UUID := uuid_generate_v4();

  -- ---- Difficulty 10 — Visionary ----
  v_string_theory UUID := uuid_generate_v4();
  v_quantum_computing UUID := uuid_generate_v4();

  -- ======== TEST / QUESTION IDs ========
  v_test_arithmetic UUID := uuid_generate_v4();
  v_test_functions UUID := uuid_generate_v4();
  v_test_derivatives UUID := uuid_generate_v4();
  v_test_velocity UUID := uuid_generate_v4();
  v_test_newtons UUID := uuid_generate_v4();
  v_test_algebra UUID := uuid_generate_v4();
  v_test_trig UUID := uuid_generate_v4();
  v_test_energy UUID := uuid_generate_v4();
  v_q1 UUID; v_q2 UUID; v_q3 UUID;

BEGIN

-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO subjects (id, name, color, description, icon) VALUES
  (v_sub_math,    'Mathematics', '#3b82f6', 'The study of numbers, quantity, structure, space, and change — the universal language of science.', '📐'),
  (v_sub_physics, 'Physics',     '#8b5cf6', 'The natural science that studies matter, energy, and the fundamental forces of the universe.', '⚛️');

-- ============================================================
-- MATH NODES
-- ============================================================

-- ==== Difficulty 1 — Beginner ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_basic_arithmetic, 'Basic Arithmetic', 'basic-arithmetic', v_sub_math, 'Number Theory',
 'The four fundamental operations: addition, subtraction, multiplication, and division. Includes integers, decimals, order of operations (PEMDAS/BODMAS), and basic number properties (commutative, associative, distributive).',
 'Arithmetic is the absolute foundation of all mathematics. Every branch — from algebra to calculus to statistics — is built on these operations.',
 ARRAY['Everyday calculations', 'Cooking measurements', 'Time and distance estimation', 'Foundation for all higher math'], 1, 0, 0),

(v_fractions, 'Fractions', 'fractions', v_sub_math, 'Number Theory',
 'A fraction a/b represents a part of a whole. Operations: finding common denominators, addition, multiplication, division (invert and multiply). Simplification and equivalent fractions. Mixed numbers and improper fractions.',
 'Fractions appear everywhere in daily life and are essential for understanding proportions, probability, and rational numbers.',
 ARRAY['Cooking recipes', 'Financial calculations', 'Probability foundations', 'Music theory'], 1, 0, 0),

(v_decimals_percentages, 'Decimals & Percentages', 'decimals-percentages', v_sub_math, 'Number Theory',
 'Decimal representation of numbers using place value system. Conversion between fractions, decimals, and percentages. Operations with decimals. Percentage increase/decrease, finding percentages of quantities.',
 'Decimals and percentages are the language of finance, statistics, and everyday quantitative reasoning.',
 ARRAY['Shopping discounts', 'Tax calculations', 'Statistics and data', 'Scientific measurement'], 1, 0, 0),

(v_basic_geometry, 'Basic Geometry', 'basic-geometry', v_sub_math, 'Geometry',
 'The study of shapes, angles, areas, and volumes. Points, lines, rays, triangles, rectangles, circles. Key formulas: area of rectangle (l×w), triangle (½bh), circumference (2πr), area of circle (πr²). Pythagorean theorem.',
 'Geometry develops spatial reasoning used in art, architecture, engineering, navigation, and computer graphics.',
 ARRAY['Architecture', 'Art and design', 'Navigation', 'Computer graphics'], 1, 0, 0),

(v_number_line, 'Number Line & Integers', 'number-line-integers', v_sub_math, 'Number Theory',
 'The number line extends infinitely in both directions. Integers include positive, negative, and zero. Absolute value |x| measures distance from zero. Ordering, comparing, and operations with negative numbers.',
 'Negative numbers and the number line are essential for understanding coordinates, debt, temperature, and algebraic thinking.',
 ARRAY['Temperature scales', 'Financial accounting', 'Elevation/depth measurement', 'Coordinate systems'], 1, 0, 0),

(v_order_of_operations, 'Order of Operations', 'order-of-operations', v_sub_math, 'Arithmetic',
 'PEMDAS/BODMAS: Parentheses/Brackets first, then Exponents/Orders, then Multiplication and Division (left to right), then Addition and Subtraction (left to right). Ensures consistent mathematical communication.',
 'Without agreed order of operations, the same expression could yield different results. This is fundamental to all computation.',
 ARRAY['Calculator usage', 'Programming expressions', 'Spreadsheet formulas', 'Mathematical communication'], 1, 0, 0),

(v_ratios_proportions, 'Ratios & Proportions', 'ratios-proportions', v_sub_math, 'Number Theory',
 'A ratio compares two quantities (a:b). A proportion states two ratios are equal. Cross-multiplication for solving. Direct and inverse proportion. Unit rates and scaling.',
 'Proportional reasoning is one of the most practically useful mathematical skills, essential for cooking, maps, models, and science.',
 ARRAY['Map scales', 'Recipe scaling', 'Drug dosage calculations', 'Model building'], 1, 0, 0);


-- ==== Difficulty 2 — Elementary ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_algebra, 'Algebra', 'algebra', v_sub_math, 'Algebra',
 'Variables represent unknowns. Solve equations by isolating variables. Factor polynomials. Linear equations (y = mx + b), quadratic equations (ax² + bx + c = 0), the quadratic formula. Systems of linear equations.',
 'Algebra is the gateway to all advanced mathematics. It teaches abstract thinking and generalizes arithmetic to solve entire classes of problems.',
 ARRAY['Programming', 'Economics', 'Engineering', 'Science'], 2, 0, 0),

(v_functions, 'Functions', 'functions', v_sub_math, 'Algebra',
 'A function f(x) assigns exactly one output to each input. Domain, range, codomain. Function composition f(g(x)). Inverse functions. Linear, quadratic, polynomial, rational, piecewise functions. Vertical line test.',
 'Functions are the fundamental building block of mathematics and science. Every model, algorithm, and equation is essentially a function.',
 ARRAY['Modeling relationships', 'Programming', 'Data analysis', 'Engineering'], 2, 0, 0),

(v_inequalities, 'Inequalities', 'inequalities', v_sub_math, 'Algebra',
 'Statements about relative size: <, >, ≤, ≥. Solving linear and quadratic inequalities. Compound inequalities. Absolute value inequalities. Graphing solution sets on number lines and coordinate planes.',
 'Inequalities define constraints and boundaries. Essential in optimization, engineering tolerances, and mathematical analysis.',
 ARRAY['Engineering tolerances', 'Optimization constraints', 'Statistics confidence intervals', 'Linear programming'], 2, 0, 0),

(v_polynomials, 'Polynomials', 'polynomials', v_sub_math, 'Algebra',
 'Expressions of the form aₙxⁿ + ... + a₁x + a₀. Degree, leading coefficient. Operations: addition, multiplication, long division, synthetic division. Factoring: GCF, grouping, difference of squares, sum/difference of cubes. Roots and the Factor Theorem.',
 'Polynomials are the simplest class of functions and approximate more complex ones. They''re central to algebra, calculus, and numerical computing.',
 ARRAY['Curve fitting', 'Interpolation', 'Signal processing', 'Computer algebra systems'], 2, 0, 0),

(v_sets_logic, 'Sets & Logic', 'sets-logic', v_sub_math, 'Foundations',
 'A set is a collection of distinct objects. Operations: union (∪), intersection (∩), complement, difference. Subsets, power sets. Logic: propositions, truth tables, AND, OR, NOT, implication, quantifiers (∀, ∃).',
 'Set theory and logic are the foundations of all mathematics. They''re directly applied in databases, digital circuits, and programming.',
 ARRAY['Database queries', 'Digital circuit design', 'Programming conditionals', 'Mathematical proofs'], 2, 0, 0),

(v_coordinate_geometry, 'Coordinate Geometry', 'coordinate-geometry', v_sub_math, 'Geometry',
 'Cartesian plane with x and y axes. Distance formula: √((x₂-x₁)² + (y₂-y₁)²). Midpoint formula. Slope m = (y₂-y₁)/(x₂-x₁). Equations of lines: slope-intercept, point-slope, general form. Parallel and perpendicular lines.',
 'Coordinate geometry bridges algebra and geometry, allowing geometric problems to be solved algebraically. Foundation of analytic geometry.',
 ARRAY['GPS and mapping', 'Computer graphics', 'Data visualization', 'Robotics'], 2, 0, 0);


-- ==== Difficulty 3 — Foundational ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_trigonometry, 'Trigonometry', 'trigonometry', v_sub_math, 'Geometry',
 'Studies relationships between angles and sides of triangles. Six trig functions: sin, cos, tan, csc, sec, cot. Unit circle. Pythagorean identity: sin²θ + cos²θ = 1. Double-angle, sum/difference formulas. Inverse trig functions.',
 'Trigonometry is used everywhere: physics (waves), engineering (signal processing), navigation, astronomy, music, and game development.',
 ARRAY['Wave analysis', 'Engineering', 'Navigation', 'Signal processing'], 3, 0, 0),

(v_vectors, 'Vectors', 'vectors', v_sub_math, 'Linear Algebra',
 'A vector has magnitude and direction. Vector addition (tip-to-tail), scalar multiplication. Dot product: a·b = |a||b|cosθ. Cross product (3D): a×b produces perpendicular vector. Unit vectors, basis vectors, components.',
 'Vectors are the language of physics and engineering. Forces, velocities, electric fields are all vectors. Fundamental in computer graphics and ML.',
 ARRAY['Physics forces', '3D graphics', 'Machine learning', 'Navigation'], 3, 0, 0),

(v_exponents_logarithms, 'Exponents & Logarithms', 'exponents-logarithms', v_sub_math, 'Algebra',
 'Exponents: aⁿ means a multiplied n times. Laws: aᵐ·aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ = aᵐⁿ. Logarithms are inverse: log_a(x) = y means aʸ = x. Natural log ln(x) = log_e(x). Properties: log(ab) = log(a) + log(b).',
 'Exponential growth/decay models population, radioactive decay, compound interest, and information. Logarithms are essential in computer science and signal processing.',
 ARRAY['Compound interest', 'Population modeling', 'Decibel scales', 'Algorithm complexity'], 3, 0, 0),

(v_sequences_series, 'Sequences & Series', 'sequences-series', v_sub_math, 'Analysis',
 'A sequence is an ordered list of numbers following a rule. Arithmetic (constant difference), geometric (constant ratio). Series: sum of sequence terms. Sigma notation. Partial sums. Convergence of infinite series.',
 'Sequences and series connect discrete patterns to continuous mathematics. They''re the foundation for calculus, finance, and computer algorithms.',
 ARRAY['Financial annuities', 'Population models', 'Computer algorithms', 'Fractal patterns'], 3, 0, 0),

(v_complex_numbers, 'Complex Numbers', 'complex-numbers', v_sub_math, 'Algebra',
 'A complex number z = a + bi where i² = -1. The complex plane: real axis and imaginary axis. Modulus |z| = √(a²+b²). Polar form: z = r(cosθ + i·sinθ) = re^(iθ). Euler''s formula: e^(iπ) + 1 = 0.',
 'Complex numbers complete the number system — every polynomial has roots in ℂ. Essential for electrical engineering, signal processing, quantum mechanics, and fluid dynamics.',
 ARRAY['AC circuit analysis', 'Signal processing', 'Quantum mechanics', 'Control theory'], 3, 0, 0),

(v_combinatorics, 'Combinatorics', 'combinatorics', v_sub_math, 'Discrete Math',
 'Counting principles: multiplication rule, addition rule. Permutations: n! / (n-r)!. Combinations: C(n,r) = n! / (r!(n-r)!). Binomial theorem: (a+b)ⁿ. Pigeonhole principle. Inclusion-exclusion.',
 'Combinatorics answers "how many ways?" questions. Critical for probability, computer science, cryptography, and optimization.',
 ARRAY['Password security analysis', 'Tournament scheduling', 'Network routing', 'Probability calculations'], 3, 0, 0),

(v_basic_probability, 'Basic Probability', 'basic-probability', v_sub_math, 'Probability',
 'Probability P(A) measures likelihood from 0 to 1. Sample space and events. P(A∪B) = P(A) + P(B) - P(A∩B). Conditional probability: P(A|B) = P(A∩B)/P(B). Independent events. Bayes'' theorem intro.',
 'Probability quantifies uncertainty. It is the mathematical framework for decision-making under uncertainty, risk assessment, and prediction.',
 ARRAY['Risk assessment', 'Weather forecasting', 'Medical diagnosis', 'Game strategy'], 3, 0, 0);


-- ==== Difficulty 4 — Developing ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_limits, 'Limits', 'limits', v_sub_math, 'Calculus',
 'A limit describes what value a function approaches as input approaches some value. One-sided limits. Limits at infinity. L''Hôpital''s rule for indeterminate forms (0/0, ∞/∞). Squeeze theorem. Epsilon-delta definition.',
 'Limits bridge algebra and calculus. They let us define derivatives and integrals with mathematical precision.',
 ARRAY['Defining derivatives', 'Analyzing discontinuities', 'Infinite series', 'Asymptotic analysis'], 4, 0, 0),

(v_derivatives, 'Derivatives', 'derivatives', v_sub_math, 'Calculus',
 'The derivative f''(x) = lim[h→0] (f(x+h)-f(x))/h measures instantaneous rate of change. Rules: power, product, quotient, chain. Implicit differentiation. Related rates. Higher-order derivatives. L''Hôpital''s rule applications.',
 'Derivatives are central to optimization, physics, economics, and machine learning (gradient descent).',
 ARRAY['Velocity from position', 'Optimization', 'ML gradient descent', 'Curve sketching'], 4, 0, 0),

(v_matrices, 'Matrices', 'matrices', v_sub_math, 'Linear Algebra',
 'A matrix is a rectangular array of numbers. Operations: addition, scalar multiplication, matrix multiplication, transpose. Determinants. Inverse matrices. Row reduction (Gaussian elimination). Rank.',
 'Matrices are essential in computer graphics, ML, quantum mechanics, and solving systems of equations.',
 ARRAY['3D transformations', 'Solving systems', 'ML and neural networks', 'Image processing'], 4, 0, 0),

(v_linear_systems, 'Linear Systems', 'linear-systems', v_sub_math, 'Linear Algebra',
 'Systems of linear equations: Ax = b. Solution methods: substitution, elimination, matrix methods (row reduction). Consistent, inconsistent, dependent systems. Geometric interpretation: intersection of planes/lines.',
 'Linear systems model countless real-world situations: traffic flow, circuit analysis, economics, and resource allocation.',
 ARRAY['Circuit analysis', 'Economics models', 'Traffic flow', 'Resource optimization'], 4, 0, 0),

(v_proof_techniques, 'Proof Techniques', 'proof-techniques', v_sub_math, 'Foundations',
 'Direct proof, proof by contradiction, proof by contrapositive, mathematical induction, proof by cases. Strong induction. Well-ordering principle. Constructive vs non-constructive proofs.',
 'Proofs are the backbone of mathematics. They provide certainty and rigor that no amount of examples can match.',
 ARRAY['Software verification', 'Cryptographic security proofs', 'Theorem proving', 'Algorithm correctness'], 4, 0, 0),

(v_conic_sections, 'Conic Sections', 'conic-sections', v_sub_math, 'Geometry',
 'Curves formed by slicing a cone: circles, ellipses, parabolas, hyperbolas. Standard forms and equations. Foci, eccentricity, directrix. Reflective properties. Degenerate cases.',
 'Conic sections describe planetary orbits (Kepler), satellite dishes (parabolas), whispering galleries (ellipses), and more.',
 ARRAY['Satellite dish design', 'Planetary orbit modeling', 'Bridge arches', 'Lens design'], 4, 0, 0),

(v_statistics, 'Statistics', 'statistics', v_sub_math, 'Statistics',
 'Descriptive: mean, median, mode, variance, standard deviation. Visualizations: histograms, box plots, scatter plots. Inferential: hypothesis testing, confidence intervals, p-values. Normal distribution. Central Limit Theorem.',
 'Statistics is the science of learning from data — essential in every field from medicine to business to social science.',
 ARRAY['Clinical trials', 'Market research', 'Quality control', 'Sports analytics'], 4, 0, 0);


-- ==== Difficulty 5 — Intermediate ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_integration, 'Integration', 'integration', v_sub_math, 'Calculus',
 'The reverse of differentiation. Definite integral: area under curve. Indefinite integral: antiderivative + C. Fundamental Theorem of Calculus. Techniques: substitution (u-sub), integration by parts, partial fractions, trig substitution.',
 'Integration calculates total quantities from rates: distance from velocity, work from force, probability from density.',
 ARRAY['Areas and volumes', 'Work done by force', 'Probability distributions', 'Signal processing'], 5, 0, 0),

(v_polar_coordinates, 'Polar Coordinates', 'polar-coordinates', v_sub_math, 'Geometry',
 'Points described by (r, θ) — distance from origin and angle. Conversion: x = r·cosθ, y = r·sinθ. Polar curves: cardioids, roses, spirals, lemniscates. Area in polar: A = ½∫r²dθ.',
 'Polar coordinates naturally describe circular and spiral phenomena — orbits, waves, and radial patterns.',
 ARRAY['Radar systems', 'Antenna patterns', 'Orbital mechanics', 'Navigation'], 5, 0, 0),

(v_parametric_equations, 'Parametric Equations', 'parametric-equations', v_sub_math, 'Calculus',
 'Curves defined by x(t) and y(t) as functions of parameter t. Eliminat parameter to get Cartesian form. Derivatives: dy/dx = (dy/dt)/(dx/dt). Arc length. Applications to projectile motion and cycloids.',
 'Parametric equations describe motion paths, animation curves, and any situation where position depends on a separate parameter like time.',
 ARRAY['Projectile trajectories', 'Animation curves', 'CNC machining paths', 'Roller coaster design'], 5, 0, 0),

(v_number_theory, 'Number Theory', 'number-theory', v_sub_math, 'Number Theory',
 'Study of integers and their properties. Divisibility, primes, GCD (Euclidean algorithm), LCM. Fundamental Theorem of Arithmetic (unique prime factorization). Modular arithmetic. Fermat''s little theorem. Chinese Remainder Theorem.',
 'Number theory is the queen of mathematics and the backbone of modern cryptography (RSA, Diffie-Hellman).',
 ARRAY['Cryptography (RSA)', 'Hash functions', 'Error detection codes', 'Computer science'], 5, 0, 0),

(v_graph_theory, 'Graph Theory', 'graph-theory', v_sub_math, 'Discrete Math',
 'Graphs consist of vertices (nodes) and edges (connections). Directed and undirected. Paths, cycles, trees. Euler and Hamilton paths. Graph coloring. Planar graphs. Connectivity. Shortest path algorithms (Dijkstra, BFS).',
 'Graph theory models networks of all kinds — social networks, computer networks, transportation, and molecular structures.',
 ARRAY['Social network analysis', 'GPS routing', 'Network design', 'Scheduling problems'], 5, 0, 0),

(v_probability_distributions, 'Probability Distributions', 'probability-distributions', v_sub_math, 'Probability',
 'A distribution describes the probability of all possible outcomes. Discrete: Binomial, Poisson, Geometric. Continuous: Normal (Gaussian), Exponential, Uniform. Expected value E(X), variance Var(X). Moment generating functions.',
 'Probability distributions are the backbone of statistics, machine learning, quality control, and risk management.',
 ARRAY['Quality control', 'Insurance pricing', 'ML model training', 'Physics simulations'], 5, 0, 0);


-- ==== Difficulty 6 — Proficient ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_differential_eq, 'Differential Equations', 'differential-equations', v_sub_math, 'Calculus',
 'Equations relating a function to its derivatives. ODEs: separable, linear, exact, Bernoulli, Euler. Solution methods: integrating factors, variation of parameters, Laplace transforms. Existence and uniqueness theorems.',
 'Differential equations describe how things change — population growth, radioactive decay, circuits, fluid flow, and more.',
 ARRAY['Population dynamics', 'Circuit analysis', 'Fluid dynamics', 'Control systems'], 6, 0, 0),

(v_multivariable_calc, 'Multivariable Calculus', 'multivariable-calculus', v_sub_math, 'Calculus',
 'Calculus of functions of several variables. Partial derivatives, gradient ∇f. Directional derivatives. Multiple integrals (double, triple). Jacobians. Change of variables. Optimization with Lagrange multipliers.',
 'Most real-world systems depend on multiple variables. Essential for physics, engineering, economics, and machine learning.',
 ARRAY['Electromagnetic fields', 'Fluid flow', 'Multi-parameter optimization', 'Weather modeling'], 6, 0, 0),

(v_linear_algebra, 'Advanced Linear Algebra', 'advanced-linear-algebra', v_sub_math, 'Linear Algebra',
 'Vector spaces (abstract), subspaces, basis, dimension. Linear transformations and their matrices. Eigenvalues, eigenvectors, diagonalization. SVD (Singular Value Decomposition). Inner product spaces. Spectral theorem.',
 'Advanced linear algebra is the backbone of machine learning, quantum computing, signal processing, and data science.',
 ARRAY['PCA', 'Quantum computing', 'Recommendation systems', 'Image compression (SVD)'], 6, 0, 0),

(v_fourier_analysis, 'Fourier Analysis', 'fourier-analysis', v_sub_math, 'Analysis',
 'Any periodic function can be decomposed into sine and cosine waves (Fourier series). Fourier transform extends to non-periodic functions. Discrete Fourier Transform (DFT), Fast Fourier Transform (FFT). Frequency domain analysis.',
 'Fourier analysis is fundamental to signal processing, audio engineering, image compression, quantum mechanics, and data analysis.',
 ARRAY['Audio compression (MP3)', 'Image processing (JPEG)', 'MRI imaging', 'Noise filtering'], 6, 0, 0),

(v_numerical_methods, 'Numerical Methods', 'numerical-methods', v_sub_math, 'Applied Math',
 'Algorithms for approximating solutions: Newton''s method (root finding), numerical integration (Simpson''s, Gauss). Euler''s method for ODEs. Runge-Kutta. Matrix computations (LU, QR decomposition). Error analysis, stability, convergence.',
 'Most real-world equations can''t be solved analytically. Numerical methods are how computers actually do mathematics.',
 ARRAY['Weather simulation', 'Structural analysis (FEA)', 'Computational fluid dynamics', 'Financial modeling'], 6, 0, 0),

(v_optimization, 'Optimization Theory', 'optimization-theory', v_sub_math, 'Applied Math',
 'Finding the best solution from a set of feasible solutions. Linear programming (simplex method). Convex optimization. Gradient descent. Lagrange multipliers. KKT conditions. Integer programming. Dynamic programming.',
 'Optimization is at the heart of machine learning, operations research, economics, and engineering design.',
 ARRAY['Machine learning training', 'Supply chain optimization', 'Portfolio optimization', 'Engineering design'], 6, 0, 0),

(v_bayesian_statistics, 'Bayesian Statistics', 'bayesian-statistics', v_sub_math, 'Statistics',
 'Uses Bayes'' theorem to update probability as evidence accumulates. Prior → Likelihood → Posterior. Conjugate priors. Markov Chain Monte Carlo (MCMC). Bayesian inference vs frequentist. Credible intervals.',
 'Bayesian statistics provides a coherent framework for reasoning under uncertainty, widely used in ML, medicine, and AI.',
 ARRAY['Spam filtering', 'Medical diagnosis', 'A/B testing', 'Machine learning'], 6, 0, 0);


-- ==== Difficulty 7 — Advanced ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_vector_calculus, 'Vector Calculus', 'vector-calculus', v_sub_math, 'Calculus',
 'Calculus with vector fields. Line integrals, surface integrals, flux. Gradient, divergence (∇·F), curl (∇×F). Fundamental theorems: Green''s theorem, Stokes'' theorem, Divergence theorem. Conservative fields.',
 'Vector calculus is the mathematical language of electromagnetism, fluid dynamics, and general relativity.',
 ARRAY['Electromagnetic theory', 'Fluid dynamics', 'Heat transfer', 'General relativity'], 7, 0, 0),

(v_partial_diff_eq, 'Partial Differential Equations', 'partial-differential-equations', v_sub_math, 'Calculus',
 'PDEs involve partial derivatives of multivariable functions. Heat equation, wave equation, Laplace''s equation. Solution methods: separation of variables, Fourier series, Green''s functions. Boundary and initial conditions.',
 'PDEs model nearly all continuous physical phenomena: heat flow, wave propagation, electrostatics, fluid dynamics, and quantum mechanics.',
 ARRAY['Heat conduction modeling', 'Acoustic design', 'Fluid simulation', 'Quantum mechanics'], 7, 0, 0),

(v_complex_analysis, 'Complex Analysis', 'complex-analysis', v_sub_math, 'Analysis',
 'Calculus on the complex plane. Analytic functions, Cauchy-Riemann equations. Contour integration. Cauchy''s integral theorem/formula. Taylor and Laurent series. Residue theorem. Conformal mappings.',
 'Complex analysis is one of the most beautiful and powerful branches of mathematics, with applications in fluid dynamics, number theory, and physics.',
 ARRAY['Fluid flow modeling', 'Evaluating real integrals', 'Electrostatics', 'Number theory proofs'], 7, 0, 0),

(v_group_theory, 'Group Theory', 'group-theory', v_sub_math, 'Abstract Algebra',
 'A group (G, ·) is a set with an associative binary operation, identity element, and inverses. Subgroups, cyclic groups, permutation groups. Lagrange''s theorem. Normal subgroups, quotient groups. Homomorphisms, isomorphisms.',
 'Group theory is the mathematics of symmetry — fundamental to physics (particle physics, crystallography), chemistry, and cryptography.',
 ARRAY['Cryptography', 'Crystallography', 'Particle physics', 'Rubik''s cube solutions'], 7, 0, 0),

(v_topology_intro, 'Introduction to Topology', 'topology-intro', v_sub_math, 'Topology',
 'Study of properties preserved under continuous deformation (stretching, bending, not tearing). Open/closed sets, continuity, connectedness, compactness. Topological spaces. Homeomorphisms. Euler characteristic. Famous examples: Möbius strip, Klein bottle.',
 'Topology provides deep insights into shape and space. Applied in data analysis (TDA), robotics, physics, and cosmology.',
 ARRAY['Topological data analysis', 'Robotics configuration spaces', 'Network topology', 'Cosmological models'], 7, 0, 0),

(v_stochastic_processes, 'Stochastic Processes', 'stochastic-processes', v_sub_math, 'Probability',
 'Random processes evolving over time. Markov chains (memoryless). Random walks. Poisson processes. Brownian motion. Martingales. Ergodic theory. Stationary processes.',
 'Stochastic processes model randomness in time — essential for finance (stock prices), physics (diffusion), biology, and queueing theory.',
 ARRAY['Stock market modeling', 'Queueing theory', 'Molecular diffusion', 'Epidemiology'], 7, 0, 0),

(v_tensor_calculus, 'Tensor Calculus', 'tensor-calculus', v_sub_math, 'Applied Math',
 'Tensors generalize scalars (rank 0), vectors (rank 1), and matrices (rank 2) to arbitrary rank. Covariant and contravariant components. Einstein summation notation. Metric tensor. Covariant derivatives. Christoffel symbols.',
 'Tensor calculus is the mathematical language of general relativity, continuum mechanics, and modern machine learning (tensor networks).',
 ARRAY['General relativity', 'Continuum mechanics', 'Deep learning frameworks', 'Elasticity theory'], 7, 0, 0);


-- ==== Difficulty 8 — Expert ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_real_analysis, 'Real Analysis', 'real-analysis', v_sub_math, 'Analysis',
 'Rigorous foundations of calculus. Formal ε-δ definitions of limits, continuity, differentiability. Sequences, series, convergence. Metric spaces. Bolzano-Weierstrass theorem. Heine-Borel theorem. Uniform convergence. Lebesgue measure.',
 'Real analysis provides the rigorous foundation that makes all of applied mathematics trustworthy.',
 ARRAY['Probability theory foundations', 'Theoretical ML proofs', 'Functional analysis', 'Mathematical physics'], 8, 0, 0),

(v_abstract_algebra, 'Abstract Algebra', 'abstract-algebra', v_sub_math, 'Abstract Algebra',
 'Studies algebraic structures: groups, rings, fields. Ring theory: ideals, quotient rings, polynomial rings. Field theory: extensions, splitting fields, Galois theory. Applications to symmetry, coding theory, cryptography.',
 'Abstract algebra underpins cryptography (RSA, ECC), coding theory, physics (symmetry groups), and computer science.',
 ARRAY['Cryptography (RSA, ECC)', 'Error-correcting codes', 'Particle physics', 'Type theory'], 8, 0, 0),

(v_information_theory, 'Information Theory', 'information-theory', v_sub_math, 'Applied Math',
 'Quantifies information and communication. Entropy H(X) = -Σ p(x) log p(x). Mutual information. Channel capacity (Shannon''s theorem). Source coding (compression). Error-correcting codes. KL divergence.',
 'Information theory is the mathematical foundation of data compression, communication, cryptography, and machine learning.',
 ARRAY['Data compression (ZIP, MP3)', 'Communication system design', 'Machine learning', 'Cryptography'], 8, 0, 0),

(v_game_theory, 'Game Theory', 'game-theory', v_sub_math, 'Applied Math',
 'Mathematical study of strategic decision-making. Normal form games, Nash equilibrium. Dominant strategies. Mixed strategies. Extensive form (game trees). Cooperative games, Shapley value. Mechanism design. Evolutionary game theory.',
 'Game theory models competitive and cooperative situations in economics, politics, biology, and AI.',
 ARRAY['Auction design', 'Economics modeling', 'AI strategy', 'Evolutionary biology'], 8, 0, 0),

(v_differential_geometry, 'Differential Geometry', 'differential-geometry', v_sub_math, 'Geometry',
 'Geometry of smooth manifolds using calculus. Curves, surfaces, curvature (Gaussian, mean). Riemannian manifolds, geodesics. Differential forms. Connections, covariant derivative. Gauss-Bonnet theorem.',
 'Differential geometry is the mathematical framework for general relativity, robotics, computer vision, and modern physics.',
 ARRAY['General relativity', 'Computer vision', 'Robotics', 'String theory'], 8, 0, 0);


-- ==== Difficulty 9 — Master ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_measure_theory, 'Measure Theory', 'measure-theory', v_sub_math, 'Analysis',
 'Generalizes the notion of length, area, and volume. σ-algebras, measures, measurable functions. Lebesgue integral (more powerful than Riemann). Convergence theorems (monotone, dominated). Product measures, Fubini''s theorem.',
 'Measure theory is the rigorous foundation of probability theory and modern integration. Essential for advanced stochastic analysis.',
 ARRAY['Rigorous probability', 'Ergodic theory', 'Quantum mechanics', 'Financial mathematics'], 9, 0, 0),

(v_functional_analysis, 'Functional Analysis', 'functional-analysis', v_sub_math, 'Analysis',
 'Study of infinite-dimensional vector spaces (function spaces). Banach spaces, Hilbert spaces. Bounded linear operators. Dual spaces. Spectral theory. Hahn-Banach, Open Mapping, Closed Graph theorems.',
 'Functional analysis is the framework for quantum mechanics, PDEs, and signal processing in infinite dimensions.',
 ARRAY['Quantum mechanics formalism', 'PDE theory', 'Signal processing theory', 'Optimization in function spaces'], 9, 0, 0),

(v_algebraic_topology, 'Algebraic Topology', 'algebraic-topology', v_sub_math, 'Topology',
 'Uses algebraic tools (groups, rings) to study topological spaces. Fundamental group π₁. Homology and cohomology groups. Simplicial and singular homology. Exact sequences. Covering spaces. Homotopy theory.',
 'Algebraic topology classifies spaces using algebra — critical for understanding higher-dimensional phenomena in physics and data science.',
 ARRAY['Topological data analysis', 'Condensed matter physics', 'String theory', 'Network analysis'], 9, 0, 0);


-- ==== Difficulty 10 — Visionary ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_category_theory, 'Category Theory', 'category-theory', v_sub_math, 'Foundations',
 'Abstract study of mathematical structures and relationships between them. Categories, objects, morphisms. Functors, natural transformations. Limits, colimits. Adjoint functors. Yoneda lemma. Monads.',
 'Category theory provides a unified language for all of mathematics and is foundational to modern programming language theory and type theory.',
 ARRAY['Programming language design', 'Database theory', 'Quantum computing', 'Unifying mathematical theories'], 10, 0, 0);


-- ============================================================
-- PHYSICS NODES
-- ============================================================

-- ==== Difficulty 1 — Beginner ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_measurement, 'Measurement & Units', 'measurement-units', v_sub_physics, 'Foundations',
 'Physics begins with measurement. SI units (meters, kilograms, seconds, Kelvin, Ampere, mole, candela). Scientific notation. Significant figures. Dimensional analysis. Unit conversions. Uncertainty and error.',
 'You cannot do physics without measuring things properly. Dimensional analysis catches errors before they become disasters.',
 ARRAY['Laboratory experiments', 'Engineering specs', 'Quality control', 'Scientific research'], 1, 0, 0),

(v_basic_motion, 'Basic Motion', 'basic-motion', v_sub_physics, 'Kinematics',
 'Objects move through space over time. Position, distance, displacement. Speed vs velocity. Describing motion with words, graphs (position-time, velocity-time), and simple equations.',
 'Motion is the most fundamental observable phenomenon in physics. Understanding it intuitively prepares you for kinematics.',
 ARRAY['Sports analytics', 'Traffic planning', 'Animation', 'Everyday prediction'], 1, 0, 0),

(v_states_of_matter, 'States of Matter', 'states-of-matter', v_sub_physics, 'Thermal Physics',
 'Solid, liquid, gas, plasma. Particle behavior in each state. Phase transitions: melting, freezing, boiling, condensation, sublimation, deposition. Latent heat. Phase diagrams.',
 'Understanding states of matter is fundamental to chemistry, materials science, and engineering.',
 ARRAY['Materials engineering', 'Weather and climate', 'Cooking science', 'Industrial processes'], 1, 0, 0),

(v_temperature_heat, 'Temperature & Heat', 'temperature-heat', v_sub_physics, 'Thermal Physics',
 'Temperature measures average kinetic energy of particles. Heat is energy transfer due to temperature difference. Conduction, convection, radiation. Specific heat capacity Q = mcΔT. Thermal equilibrium.',
 'Heat transfer governs cooking, climate, building insulation, engine design, and electronics cooling.',
 ARRAY['Building insulation', 'Cooking', 'Engine design', 'Climate science'], 1, 0, 0),

(v_basic_electricity, 'Basic Electricity', 'basic-electricity', v_sub_physics, 'E&M',
 'Electric current is the flow of charge. Voltage (potential difference) drives current through resistance. Ohm''s law: V = IR. Series and parallel circuits basics. Conductors, insulators, semiconductors.',
 'Electricity powers modern civilization. Understanding basic circuits is essential for anyone in a technological society.',
 ARRAY['Home electrical safety', 'Electronic devices', 'Troubleshooting circuits', 'Energy conservation'], 1, 0, 0),

(v_light_basics, 'Light Basics', 'light-basics', v_sub_physics, 'Optics',
 'Light is an electromagnetic wave and a particle (photon). Speed of light c ≈ 3×10⁸ m/s. Reflection, refraction, absorption. Visible spectrum (ROYGBIV). Shadows, pinhole cameras. Color mixing.',
 'Light is how we perceive the world. Understanding it leads to optics, lasers, fiber optics, cameras, and vision science.',
 ARRAY['Photography', 'Fiber optics', 'Solar energy', 'Vision science'], 1, 0, 0),

(v_sound_basics, 'Sound Basics', 'sound-basics', v_sub_physics, 'Wave Physics',
 'Sound is a longitudinal wave propagating through a medium. Frequency (pitch), amplitude (loudness), speed of sound (~343 m/s in air). Echoes, resonance. Decibel scale. Ultrasound and infrasound.',
 'Sound is our primary communication medium. Understanding acoustics is essential for music, architecture, and medical imaging.',
 ARRAY['Music production', 'Architectural acoustics', 'Ultrasound imaging', 'Noise control'], 1, 0, 0);


-- ==== Difficulty 2 — Elementary ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_velocity, 'Velocity', 'velocity', v_sub_physics, 'Kinematics',
 'Velocity is rate of change of position — a vector with magnitude (speed) and direction. Average velocity = displacement/time. Instantaneous velocity is the derivative of position: v = dx/dt.',
 'Understanding velocity connects everyday motion experience to calculus and is essential for all of mechanics.',
 ARRAY['Trajectory prediction', 'Vehicle dynamics', 'Sports analytics', 'Space missions'], 2, 0, 0),

(v_acceleration, 'Acceleration', 'acceleration', v_sub_physics, 'Kinematics',
 'Acceleration is rate of change of velocity: a = dv/dt = d²x/dt². Constant acceleration leads to kinematic equations: v = v₀ + at, x = x₀ + v₀t + ½at². Deceleration is negative acceleration.',
 'Acceleration is the bridge between forces and motion. It explains speeding up, slowing down, and direction changes.',
 ARRAY['Vehicle braking', 'Roller coasters', 'Rocket propulsion', 'Earthquake engineering'], 2, 0, 0),

(v_gravity, 'Gravity', 'gravity', v_sub_physics, 'Dynamics',
 'Universal attractive force between masses. Near Earth: g ≈ 9.8 m/s². Newton''s law of gravitation: F = Gm₁m₂/r². Free fall, projectile motion basics. Weight vs mass.',
 'Gravity is one of the four fundamental forces. It governs planetary motion, tides, and spacetime curvature.',
 ARRAY['Satellite orbits', 'Building design', 'Tidal prediction', 'Space exploration'], 2, 0, 0),

(v_friction, 'Friction', 'friction', v_sub_physics, 'Dynamics',
 'Friction is a contact force opposing relative motion. Static friction (prevents motion): fs ≤ μsN. Kinetic friction (during motion): fk = μkN. Depends on surface properties and normal force, not contact area.',
 'Friction is everywhere — walking, driving, braking, writing. Engineers must manage friction for safety and efficiency.',
 ARRAY['Brake design', 'Tire engineering', 'Bearing design', 'Sports equipment'], 2, 0, 0),

(v_pressure, 'Pressure', 'pressure', v_sub_physics, 'Fluid Physics',
 'Pressure is force per unit area: P = F/A. In fluids: P = ρgh (hydrostatic). Atmospheric pressure ≈ 101,325 Pa. Pascal''s principle. Gauge vs absolute pressure.',
 'Pressure concepts are essential for fluid mechanics, weather, engineering, and medicine (blood pressure).',
 ARRAY['Hydraulic systems', 'Weather forecasting', 'Scuba diving', 'Blood pressure'], 2, 0, 0),

(v_density_buoyancy, 'Density & Buoyancy', 'density-buoyancy', v_sub_physics, 'Fluid Physics',
 'Density ρ = m/V. Objects float when their density < fluid density. Archimedes'' principle: buoyant force = weight of displaced fluid. Fb = ρ_fluid × V_displaced × g. Apparent weight.',
 'Buoyancy explains why ships float, hot air rises, and submarines dive. Essential for marine engineering and atmospheric science.',
 ARRAY['Ship design', 'Submarine engineering', 'Hot air balloons', 'Mineral identification'], 2, 0, 0),

(v_simple_machines, 'Simple Machines', 'simple-machines', v_sub_physics, 'Mechanics',
 'Six simple machines: lever, pulley, wheel-axle, inclined plane, wedge, screw. Mechanical advantage = output force / input force. Trade-off: gain force but lose distance. Efficiency = useful work out / total work in.',
 'Simple machines are the building blocks of all complex machinery. They demonstrate the fundamental principle of energy conservation.',
 ARRAY['Construction equipment', 'Bicycle mechanics', 'Tool design', 'Robotics'], 2, 0, 0);


-- ==== Difficulty 3 — Foundational ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_projectile_motion, 'Projectile Motion', 'projectile-motion', v_sub_physics, 'Kinematics',
 'Two-dimensional motion under gravity. Horizontal (constant velocity) and vertical (constant acceleration g) components are independent. Range, max height, time of flight. Trajectory is parabolic.',
 'Projectile motion combines kinematics in two dimensions and is one of the most elegant applications of Newton''s mechanics.',
 ARRAY['Ballistics', 'Sports (basketball, golf)', 'Fireworks design', 'Space launch trajectories'], 3, 0, 0),

(v_electric_charge, 'Electric Charge', 'electric-charge', v_sub_physics, 'E&M',
 'Two types: positive and negative. Like charges repel, opposites attract. Coulomb''s law: F = kq₁q₂/r². Charge is quantized (e = 1.6×10⁻¹⁹ C) and conserved. Charging: friction, conduction, induction.',
 'Electric charge is the source of electromagnetic phenomena — one of the four fundamental forces that governs atoms, chemistry, and technology.',
 ARRAY['Electrostatics', 'Lightning protection', 'Xerography', 'Particle accelerators'], 3, 0, 0),

(v_dc_circuits, 'DC Circuits', 'dc-circuits', v_sub_physics, 'E&M',
 'Direct current circuits: Ohm''s law V = IR. Kirchhoff''s laws (current at junction = 0, voltage around loop = 0). Series and parallel resistors. Power P = IV = I²R = V²/R. RC and RL circuits.',
 'DC circuit analysis is fundamental to all electrical engineering, electronics, and understanding how electronic devices work.',
 ARRAY['Electronics design', 'Power systems', 'Arduino/microcontrollers', 'Electric vehicles'], 3, 0, 0),

(v_reflection_refraction, 'Reflection & Refraction', 'reflection-refraction', v_sub_physics, 'Optics',
 'Reflection: angle of incidence = angle of reflection. Plane and curved mirrors. Refraction: Snell''s law n₁sinθ₁ = n₂sinθ₂. Total internal reflection. Dispersion (prisms, rainbows).',
 'Reflection and refraction explain mirrors, lenses, fiber optics, rainbows, and form the basis of all optical technology.',
 ARRAY['Mirror design', 'Lens design', 'Fiber optics', 'Rainbow formation'], 3, 0, 0),

(v_kinematic_equations, 'Kinematic Equations', 'kinematic-equations', v_sub_physics, 'Kinematics',
 'The five equations of constant-acceleration motion: v = v₀ + at, x = x₀ + v₀t + ½at², v² = v₀² + 2a(x-x₀), x = ½(v+v₀)t. Choosing the right equation based on known/unknown quantities.',
 'These equations are the primary tools for solving motion problems and are used constantly in engineering and physics.',
 ARRAY['Vehicle dynamics', 'Space mission planning', 'Sports physics', 'Accident reconstruction'], 3, 0, 0);


-- ==== Difficulty 4 — Developing ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_force, 'Force', 'force', v_sub_physics, 'Dynamics',
 'A force is a push or pull that can change motion. Measured in Newtons (N). Types: gravitational, electromagnetic, friction, tension, normal, applied, spring (F = -kx). Free-body diagrams. Net force = ma.',
 'Force is one of the most fundamental concepts in physics. Understanding forces lets you analyze everything from bridges to biological systems.',
 ARRAY['Structural engineering', 'Mechanical design', 'Biomechanics', 'Aerospace'], 4, 0, 0),

(v_newtons_laws, 'Newton''s Laws of Motion', 'newtons-laws', v_sub_physics, 'Dynamics',
 'Three laws: (1) Inertia — objects maintain motion unless acted on by net force. (2) F = ma — acceleration is proportional to net force. (3) Action-reaction — every force has an equal opposite force.',
 'Newton''s laws are the foundation of classical mechanics. They predict motion from projectiles to planets.',
 ARRAY['Vehicle safety', 'Orbital mechanics', 'Sports physics', 'Industrial machinery'], 4, 0, 0),

(v_energy, 'Energy', 'energy', v_sub_physics, 'Mechanics',
 'Energy is the capacity to do work. Kinetic: KE = ½mv². Potential: gravitational PE = mgh, elastic PE = ½kx². Conservation of energy. Work-energy theorem: W_net = ΔKE. Power P = dW/dt.',
 'Energy conservation is one of the most powerful principles in all of physics.',
 ARRAY['Power generation', 'Renewable energy', 'Thermodynamics', 'Climate science'], 4, 0, 0),

(v_work_power, 'Work & Power', 'work-power', v_sub_physics, 'Mechanics',
 'Work W = F·d·cosθ = ∫F·dx. Work done by variable forces. Power P = dW/dt = F·v. Efficiency η = useful output / total input. Work-energy theorem connects work to kinetic energy change.',
 'Work and power quantify energy transfer and the rate of energy use — essential for engineering and physics.',
 ARRAY['Engine rating', 'Electrical power systems', 'Athletic performance', 'Machine efficiency'], 4, 0, 0),

(v_simple_harmonic, 'Simple Harmonic Motion', 'simple-harmonic-motion', v_sub_physics, 'Wave Physics',
 'Oscillation where restoring force is proportional to displacement: F = -kx. Solution: x(t) = A·cos(ωt + φ). Period T = 2π√(m/k) for springs, T = 2π√(L/g) for pendulums. Energy oscillates between KE and PE.',
 'SHM is the foundation for understanding all oscillations and waves. It describes springs, pendulums, molecules, and LC circuits.',
 ARRAY['Clock pendulums', 'Suspension design', 'Molecular vibrations', 'LC circuits'], 4, 0, 0);


-- ==== Difficulty 5 — Intermediate ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_momentum, 'Momentum', 'momentum', v_sub_physics, 'Mechanics',
 'Linear momentum p = mv (vector). Impulse J = FΔt = Δp. Conservation of momentum in isolated systems. Center of mass. Elastic vs inelastic collisions.',
 'Momentum conservation is fundamental to understanding collisions, explosions, rocket propulsion, and particle physics.',
 ARRAY['Crash analysis', 'Rocket propulsion', 'Billiards physics', 'Particle physics'], 5, 0, 0),

(v_circular_motion, 'Circular Motion', 'circular-motion', v_sub_physics, 'Dynamics',
 'Motion in a circle requires centripetal acceleration a_c = v²/r directed toward center. Centripetal force F_c = mv²/r. Angular velocity ω = v/r. Period T = 2πr/v. Banking of curves. Vertical circles.',
 'Circular motion describes orbits, rotating machinery, amusement park rides, and particle accelerators.',
 ARRAY['Roller coaster design', 'Satellite orbits', 'Centrifuge design', 'Banked road design'], 5, 0, 0),

(v_torque_rotation, 'Torque & Rotation', 'torque-rotation', v_sub_physics, 'Mechanics',
 'Torque τ = r × F. Moment of inertia I = Σmr². Rotational Newton''s law: τ = Iα. Angular momentum L = Iω. Conservation of angular momentum. Rotational kinetic energy: KE = ½Iω². Parallel axis theorem.',
 'Rotational mechanics governs everything that spins — wheels, turbines, planets, galaxies, and figure skaters.',
 ARRAY['Engine design', 'Gyroscopes', 'Helicopter rotors', 'Spinning toys'], 5, 0, 0),

(v_fluid_mechanics, 'Fluid Mechanics', 'fluid-mechanics', v_sub_physics, 'Fluid Physics',
 'Fluids at rest (hydrostatics) and in motion (hydrodynamics). Continuity equation A₁v₁ = A₂v₂. Bernoulli''s equation: P + ½ρv² + ρgh = constant. Viscosity, Reynolds number. Laminar vs turbulent flow.',
 'Fluid mechanics describes water flow, air flow, blood circulation, and weather — essential for engineering and medicine.',
 ARRAY['Aircraft design', 'Pipeline engineering', 'Blood flow analysis', 'Weather prediction'], 5, 0, 0),

(v_geometric_optics, 'Geometric Optics', 'geometric-optics', v_sub_physics, 'Optics',
 'Ray model of light. Thin lens equation: 1/f = 1/do + 1/di. Mirror equation. Magnification m = -di/do. Converging and diverging lenses. Lens combinations. Optical instruments: microscope, telescope, camera.',
 'Geometric optics explains how lenses and mirrors form images — the basis of cameras, microscopes, telescopes, and eyeglasses.',
 ARRAY['Camera design', 'Microscope optics', 'Telescope design', 'Vision correction'], 5, 0, 0),

(v_electric_fields, 'Electric Fields', 'electric-fields', v_sub_physics, 'E&M',
 'Electric field E = F/q = kQ/r² (point charge). Field lines. Superposition principle. Gauss''s law: ∮E·dA = Q_enc/ε₀. Electric potential V = kQ/r. Equipotential surfaces. Capacitance C = Q/V. Energy stored: U = ½CV².',
 'Electric fields are the foundation of electrostatics and lead to understanding capacitors, circuits, and electromagnetism.',
 ARRAY['Capacitor design', 'Electrostatic precipitators', 'Van de Graaff generators', 'CRT displays'], 5, 0, 0),

(v_magnetic_fields, 'Magnetic Fields', 'magnetic-fields', v_sub_physics, 'E&M',
 'Magnetic field B from moving charges and currents. Force on moving charge: F = qv × B. Force on wire: F = IL × B. Biot-Savart law. Ampère''s law: ∮B·dl = μ₀I_enc. Solenoids, toroids. Magnetic flux.',
 'Magnetic fields are generated by all electric currents. They enable motors, generators, MRI, and magnetic storage.',
 ARRAY['Electric motors', 'MRI machines', 'Magnetic storage', 'Particle accelerators'], 5, 0, 0),

(v_collisions, 'Collisions', 'collisions', v_sub_physics, 'Mechanics',
 'Elastic collisions: both momentum and kinetic energy conserved. Inelastic: only momentum conserved. Perfectly inelastic: objects stick together. Coefficient of restitution. 2D collisions. Center of mass frame.',
 'Collision physics is crucial for vehicle safety, particle physics experiments, astrophysics, and sports.',
 ARRAY['Crash testing', 'Particle accelerator experiments', 'Pool/billiards', 'Asteroid impact analysis'], 5, 0, 0),

(v_gravitation, 'Gravitation', 'gravitation', v_sub_physics, 'Dynamics',
 'Newton''s law of universal gravitation: F = Gm₁m₂/r². Gravitational field g = GM/r². Orbital mechanics: Kepler''s three laws. Escape velocity: v_esc = √(2GM/r). Gravitational potential energy: U = -GMm/r.',
 'Gravitation governs the structure of the universe — from falling apples to orbiting planets to the expansion of spacetime.',
 ARRAY['Satellite deployment', 'Space missions', 'Tidal modeling', 'Binary star systems'], 5, 0, 0);


-- ==== Difficulty 6 — Proficient ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_thermodynamics, 'Thermodynamics', 'thermodynamics', v_sub_physics, 'Thermal Physics',
 'Four laws: zeroth (thermal equilibrium), first (ΔU = Q - W), second (entropy ΔS ≥ 0), third (absolute zero unreachable). Heat engines, Carnot cycle, entropy, free energy. Thermodynamic potentials.',
 'Thermodynamics governs engines, refrigerators, chemical reactions, stars, and the arrow of time.',
 ARRAY['Engine design', 'Refrigeration', 'Chemical engineering', 'Astrophysics'], 6, 0, 0),

(v_electromagnetism, 'Electromagnetism', 'electromagnetism', v_sub_physics, 'E&M',
 'Unified theory of electric and magnetic forces. Faraday''s law: EMF = -dΦ_B/dt. Lenz''s law. Self-inductance L. Mutual inductance. Electromagnetic induction. Energy in fields.',
 'Electromagnetism explains generators, transformers, and leads to Maxwell''s equations and understanding light.',
 ARRAY['Power generation', 'Transformers', 'Wireless charging', 'Electric guitars'], 6, 0, 0),

(v_waves, 'Waves & Oscillations', 'waves-oscillations', v_sub_physics, 'Wave Physics',
 'Mechanical and electromagnetic waves. Transverse and longitudinal. Wave equation: ∂²y/∂t² = v²∂²y/∂x². Superposition, interference, diffraction. Standing waves, resonance. Doppler effect. Sound intensity.',
 'Waves describe sound, light, water, earthquakes, and quantum particles. Understanding waves is essential for modern technology.',
 ARRAY['Acoustics', 'Fiber optics', 'Seismology', 'Quantum mechanics'], 6, 0, 0),

(v_wave_optics, 'Wave Optics', 'wave-optics', v_sub_physics, 'Optics',
 'Wave nature of light: Young''s double-slit experiment. Interference patterns. Diffraction: single slit, gratings. Polarization: Malus''s law. Thin film interference. Huygens'' principle. Resolution limit.',
 'Wave optics explains phenomena that ray optics cannot — diffraction, interference, polarization — essential for modern optical technology.',
 ARRAY['Holography', 'Anti-reflective coatings', 'Spectroscopy', 'LCD displays'], 6, 0, 0),

(v_ac_circuits, 'AC Circuits', 'ac-circuits', v_sub_physics, 'E&M',
 'Alternating current: V(t) = V₀sin(ωt). Impedance Z. Resistors, capacitors, inductors in AC. Phasor analysis. Resonance in RLC circuits. Power factor. Transformers. Three-phase power.',
 'AC circuit analysis is essential for understanding power distribution, electronics, radio, and signal processing.',
 ARRAY['Power grid design', 'Radio tuning', 'Filter design', 'Audio amplifiers'], 6, 0, 0),

(v_atomic_structure, 'Atomic Structure', 'atomic-structure', v_sub_physics, 'Quantum',
 'Bohr model: quantized energy levels E_n = -13.6/n² eV. Quantum numbers (n, l, ml, ms). Electron orbitals (s, p, d, f). Pauli exclusion principle. Aufbau principle. Periodic table from quantum mechanics. Emission/absorption spectra.',
 'Atomic structure explains chemistry, spectroscopy, and is the bridge between quantum mechanics and the observable world.',
 ARRAY['Spectroscopy', 'Laser design', 'Chemical bonding', 'Materials science'], 6, 0, 0);


-- ==== Difficulty 7 — Advanced ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_maxwells_equations, 'Maxwell''s Equations', 'maxwells-equations', v_sub_physics, 'E&M',
 'Four equations unifying electricity and magnetism: Gauss''s law (E), Gauss''s law (B), Faraday''s law, Ampère-Maxwell law. Predict electromagnetic waves. Speed of light c = 1/√(μ₀ε₀). Electromagnetic spectrum.',
 'Maxwell''s equations are the crowning achievement of classical physics — they unify electricity, magnetism, and optics and predict all electromagnetic radiation.',
 ARRAY['Antenna design', 'Radar systems', 'Microwave engineering', 'Optical design'], 7, 0, 0),

(v_lagrangian_mechanics, 'Lagrangian Mechanics', 'lagrangian-mechanics', v_sub_physics, 'Classical Mechanics',
 'Reformulation of mechanics using the Lagrangian L = T - V (kinetic minus potential energy). Euler-Lagrange equations: d/dt(∂L/∂q̇) - ∂L/∂q = 0. Generalized coordinates. Constraints. Noether''s theorem: symmetry → conservation law.',
 'Lagrangian mechanics is more powerful than Newtonian for complex systems. It connects symmetry to conservation laws and leads to modern physics.',
 ARRAY['Complex mechanical systems', 'Robotics', 'Particle physics', 'Field theory'], 7, 0, 0),

(v_hamiltonian_mechanics, 'Hamiltonian Mechanics', 'hamiltonian-mechanics', v_sub_physics, 'Classical Mechanics',
 'Reformulation using Hamiltonian H = T + V. Hamilton''s equations: q̇ = ∂H/∂p, ṗ = -∂H/∂q. Phase space. Canonical transformations. Poisson brackets. Hamilton-Jacobi equation. Liouville''s theorem.',
 'Hamiltonian mechanics is the bridge between classical and quantum mechanics. Its structure appears in quantum mechanics, optics, and statistical mechanics.',
 ARRAY['Quantum mechanics foundation', 'Celestial mechanics', 'Plasma physics', 'Optics'], 7, 0, 0),

(v_statistical_mechanics, 'Statistical Mechanics', 'statistical-mechanics', v_sub_physics, 'Thermal Physics',
 'Connects microscopic particle behavior to macroscopic thermodynamics. Microstates, macrostates. Boltzmann distribution. Partition function Z. Entropy S = k_B ln(Ω). Bose-Einstein, Fermi-Dirac, Maxwell-Boltzmann distributions.',
 'Statistical mechanics explains thermodynamics from first principles and is essential for understanding matter at the atomic level.',
 ARRAY['Phase transitions', 'Material properties', 'Black hole thermodynamics', 'Quantum gases'], 7, 0, 0),

(v_nuclear_physics, 'Nuclear Physics', 'nuclear-physics', v_sub_physics, 'Nuclear',
 'Structure of atomic nuclei: protons and neutrons bound by strong force. Binding energy, mass defect. Radioactive decay (α, β, γ). Half-life. Nuclear fission and fusion. E = mc². Nuclear reactions and Q-values.',
 'Nuclear physics explains radioactivity, nuclear power, nuclear weapons, stellar energy, and medical isotopes.',
 ARRAY['Nuclear power plants', 'Medical imaging (PET)', 'Carbon dating', 'Stellar nucleosynthesis'], 7, 0, 0),

(v_semiconductor_physics, 'Semiconductor Physics', 'semiconductor-physics', v_sub_physics, 'Solid State',
 'Band theory: valence and conduction bands, band gap. Intrinsic semiconductors. Doping: n-type and p-type. PN junctions, depletion zone. Diodes, transistors (BJT, FET). LEDs, solar cells.',
 'Semiconductor physics is the foundation of all modern electronics — from smartphones to computers to solar panels.',
 ARRAY['Microprocessor design', 'Solar cell engineering', 'LED technology', 'Sensor design'], 7, 0, 0);


-- ==== Difficulty 8 — Expert ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_quantum_intro, 'Quantum Mechanics', 'quantum-mechanics', v_sub_physics, 'Quantum',
 'Physics at atomic and subatomic scales. Wave-particle duality. Schrödinger equation: iℏ∂ψ/∂t = Ĥψ. Heisenberg uncertainty: ΔxΔp ≥ ℏ/2. Quantum states, operators, measurement. Superposition, entanglement, tunneling.',
 'Quantum mechanics is the most successful physical theory ever — it explains atoms, chemistry, semiconductors, and enables quantum computing.',
 ARRAY['Semiconductor design', 'Laser technology', 'Quantum computing', 'Chemical bonding'], 8, 0, 0),

(v_special_relativity, 'Special Relativity', 'special-relativity', v_sub_physics, 'Relativity',
 'For objects at high speeds. Two postulates: (1) laws of physics same in all inertial frames, (2) speed of light is constant. Time dilation, length contraction. Lorentz transformations. Four-vectors. E² = (pc)² + (mc²)². Spacetime diagrams.',
 'Special relativity fundamentally changed our understanding of space, time, and energy.',
 ARRAY['GPS corrections', 'Particle accelerators', 'Nuclear energy', 'Astrophysics'], 8, 0, 0),

(v_plasma_physics, 'Plasma Physics', 'plasma-physics', v_sub_physics, 'Plasma',
 'Plasma: ionized gas with free electrons and ions. Debye shielding, plasma frequency. Magnetohydrodynamics (MHD). Plasma confinement: magnetic mirrors, tokamaks. Plasma waves. 99% of visible matter is plasma.',
 'Plasma physics is essential for fusion energy, space physics, astrophysics, and industrial applications.',
 ARRAY['Fusion energy (ITER, tokamaks)', 'Space weather prediction', 'Plasma cutting/welding', 'Neon signs'], 8, 0, 0),

(v_astrophysics, 'Astrophysics', 'astrophysics', v_sub_physics, 'Astrophysics',
 'Physics of celestial objects. Stellar structure, evolution, and nucleosynthesis. Hertzsprung-Russell diagram. White dwarfs, neutron stars, black holes. Galaxies, dark matter, dark energy. Cosmic microwave background.',
 'Astrophysics reveals the origin, structure, and fate of the universe — one of humanity''s deepest quests.',
 ARRAY['Space exploration', 'Satellite design', 'Navigation systems', 'Technology development'], 8, 0, 0);


-- ==== Difficulty 9 — Master ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_general_relativity, 'General Relativity', 'general-relativity', v_sub_physics, 'Relativity',
 'Einstein''s theory of gravity as spacetime curvature. Einstein field equations: G_μν + Λg_μν = (8πG/c⁴)T_μν. Schwarzschild solution (black holes). Gravitational lensing, waves, time dilation. GPS corrections.',
 'General relativity describes the large-scale structure of the universe, black holes, gravitational waves, and the Big Bang.',
 ARRAY['GPS precision', 'Black hole imaging', 'Gravitational wave detection', 'Cosmological models'], 9, 0, 0),

(v_quantum_field_theory, 'Quantum Field Theory', 'quantum-field-theory', v_sub_physics, 'Quantum',
 'Merges quantum mechanics with special relativity. Fields are the fundamental objects, particles are excitations. Feynman diagrams. QED (quantum electrodynamics), QCD (quantum chromodynamics). Renormalization. Standard Model.',
 'QFT is the framework for the Standard Model of particle physics — our best description of fundamental particles and forces.',
 ARRAY['Particle physics predictions', 'Condensed matter physics', 'Cosmology', 'Quantum computing theory'], 9, 0, 0),

(v_particle_physics, 'Particle Physics', 'particle-physics', v_sub_physics, 'Nuclear',
 'Study of fundamental particles and forces. Standard Model: quarks (6 flavors), leptons (6), gauge bosons (photon, W±, Z, gluons), Higgs boson. Four forces: electromagnetic, weak, strong, gravitational. Matter-antimatter asymmetry.',
 'Particle physics reveals the fundamental building blocks of the universe and seeks to unify all forces.',
 ARRAY['CERN experiments', 'Medical PET scans', 'Materials analysis', 'Cosmology'], 9, 0, 0),

(v_condensed_matter, 'Condensed Matter Physics', 'condensed-matter', v_sub_physics, 'Solid State',
 'Physics of solid and liquid phases. Crystal structures, Bravais lattices. Electronic band theory. Superconductivity (BCS theory). Superfluidity. Magnetic ordering. Topological insulators. Quantum Hall effect.',
 'Condensed matter physics drives materials science and technology — semiconductors, superconductors, magnets, and metamaterials.',
 ARRAY['Superconductor applications', 'New materials design', 'Magnetic storage', 'Quantum computing hardware'], 9, 0, 0),

(v_cosmology, 'Cosmology', 'cosmology', v_sub_physics, 'Astrophysics',
 'Study of the origin, evolution, and fate of the universe. Big Bang theory. Friedmann equations. Cosmic microwave background. Inflation theory. Dark matter and dark energy (ΛCDM model). Nucleosynthesis. Observable universe.',
 'Cosmology addresses the biggest questions: How did the universe begin? What is it made of? How will it end?',
 ARRAY['Satellite missions (WMAP, Planck)', 'Dark matter detection', 'Gravitational wave astronomy', 'Fundamental physics'], 9, 0, 0);


-- ==== Difficulty 10 — Visionary ====
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_string_theory, 'String Theory', 'string-theory', v_sub_physics, 'Theoretical',
 'Proposes that fundamental entities are 1D strings rather than 0D points. Vibration modes determine particle properties. Requires extra dimensions (10 or 11). M-theory unifies five string theories. AdS/CFT correspondence.',
 'String theory is the leading candidate for a "theory of everything" unifying quantum mechanics and general relativity.',
 ARRAY['Theoretical physics research', 'Mathematical physics', 'Black hole information paradox', 'Holographic principle'], 10, 0, 0),

(v_quantum_computing, 'Quantum Computing', 'quantum-computing-physics', v_sub_physics, 'Quantum',
 'Uses quantum mechanical phenomena (superposition, entanglement) for computation. Qubits vs classical bits. Quantum gates and circuits. Quantum algorithms: Shor''s (factoring), Grover''s (search). Quantum error correction. Decoherence.',
 'Quantum computing promises exponential speedup for certain problems — cryptography, drug discovery, optimization, and simulation.',
 ARRAY['Cryptography breaking/making', 'Drug molecule simulation', 'Optimization problems', 'Materials discovery'], 10, 0, 0);


-- ============================================================
-- EDGES — Full spider web of connections
-- ============================================================
INSERT INTO edges (source_node_id, target_node_id, relationship_type) VALUES

  -- ============================
  -- MATH: Elementary → Foundational
  -- ============================
  (v_basic_arithmetic, v_fractions, 'leads_to'),
  (v_basic_arithmetic, v_decimals_percentages, 'leads_to'),
  (v_basic_arithmetic, v_algebra, 'leads_to'),
  (v_basic_arithmetic, v_order_of_operations, 'leads_to'),
  (v_basic_arithmetic, v_ratios_proportions, 'leads_to'),
  (v_fractions, v_algebra, 'leads_to'),
  (v_fractions, v_ratios_proportions, 'related_to'),
  (v_fractions, v_basic_probability, 'leads_to'),
  (v_decimals_percentages, v_algebra, 'leads_to'),
  (v_decimals_percentages, v_basic_probability, 'leads_to'),
  (v_decimals_percentages, v_statistics, 'leads_to'),
  (v_basic_geometry, v_trigonometry, 'leads_to'),
  (v_basic_geometry, v_vectors, 'leads_to'),
  (v_basic_geometry, v_coordinate_geometry, 'leads_to'),
  (v_number_line, v_algebra, 'leads_to'),
  (v_number_line, v_inequalities, 'leads_to'),
  (v_number_line, v_coordinate_geometry, 'leads_to'),
  (v_order_of_operations, v_algebra, 'leads_to'),
  (v_ratios_proportions, v_basic_probability, 'related_to'),

  -- ============================
  -- MATH: Foundational → Foundational (cross-links)
  -- ============================
  (v_algebra, v_functions, 'leads_to'),
  (v_algebra, v_polynomials, 'leads_to'),
  (v_algebra, v_inequalities, 'leads_to'),
  (v_algebra, v_exponents_logarithms, 'leads_to'),
  (v_algebra, v_sequences_series, 'leads_to'),
  (v_algebra, v_complex_numbers, 'leads_to'),
  (v_functions, v_exponents_logarithms, 'related_to'),
  (v_functions, v_trigonometry, 'related_to'),
  (v_coordinate_geometry, v_vectors, 'related_to'),
  (v_coordinate_geometry, v_conic_sections, 'leads_to'),
  (v_sets_logic, v_basic_probability, 'leads_to'),
  (v_sets_logic, v_combinatorics, 'leads_to'),
  (v_sets_logic, v_proof_techniques, 'leads_to'),
  (v_combinatorics, v_basic_probability, 'leads_to'),
  (v_polynomials, v_functions, 'related_to'),
  (v_trigonometry, v_complex_numbers, 'related_to'),
  (v_trigonometry, v_vectors, 'related_to'),

  -- ============================
  -- MATH: Foundational → Intermediate
  -- ============================
  (v_functions, v_limits, 'leads_to'),
  (v_functions, v_conic_sections, 'leads_to'),
  (v_functions, v_parametric_equations, 'leads_to'),
  (v_exponents_logarithms, v_limits, 'leads_to'),
  (v_exponents_logarithms, v_derivatives, 'related_to'),
  (v_polynomials, v_limits, 'leads_to'),
  (v_polynomials, v_derivatives, 'related_to'),
  (v_trigonometry, v_limits, 'used_in'),
  (v_trigonometry, v_polar_coordinates, 'leads_to'),
  (v_vectors, v_matrices, 'leads_to'),
  (v_vectors, v_linear_systems, 'leads_to'),
  (v_sequences_series, v_limits, 'leads_to'),
  (v_basic_probability, v_statistics, 'leads_to'),
  (v_basic_probability, v_probability_distributions, 'leads_to'),
  (v_combinatorics, v_probability_distributions, 'leads_to'),
  (v_combinatorics, v_graph_theory, 'related_to'),
  (v_sets_logic, v_graph_theory, 'leads_to'),
  (v_inequalities, v_limits, 'related_to'),
  (v_coordinate_geometry, v_polar_coordinates, 'leads_to'),
  (v_coordinate_geometry, v_parametric_equations, 'leads_to'),
  (v_complex_numbers, v_polar_coordinates, 'related_to'),

  -- ============================
  -- MATH: Intermediate → Intermediate (cross-links)
  -- ============================
  (v_limits, v_derivatives, 'leads_to'),
  (v_derivatives, v_integration, 'leads_to'),
  (v_matrices, v_linear_systems, 'leads_to'),
  (v_statistics, v_probability_distributions, 'leads_to'),
  (v_polar_coordinates, v_parametric_equations, 'related_to'),
  (v_conic_sections, v_polar_coordinates, 'related_to'),
  (v_proof_techniques, v_number_theory, 'leads_to'),

  -- ============================
  -- MATH: Intermediate → Advanced
  -- ============================
  (v_derivatives, v_differential_eq, 'leads_to'),
  (v_derivatives, v_multivariable_calc, 'leads_to'),
  (v_derivatives, v_optimization, 'leads_to'),
  (v_integration, v_differential_eq, 'leads_to'),
  (v_integration, v_multivariable_calc, 'leads_to'),
  (v_integration, v_fourier_analysis, 'leads_to'),
  (v_integration, v_numerical_methods, 'leads_to'),
  (v_matrices, v_linear_algebra, 'leads_to'),
  (v_matrices, v_numerical_methods, 'leads_to'),
  (v_linear_systems, v_linear_algebra, 'leads_to'),
  (v_limits, v_real_analysis, 'leads_to'),
  (v_number_theory, v_group_theory, 'leads_to'),
  (v_proof_techniques, v_group_theory, 'leads_to'),
  (v_proof_techniques, v_topology_intro, 'leads_to'),
  (v_probability_distributions, v_bayesian_statistics, 'leads_to'),
  (v_probability_distributions, v_stochastic_processes, 'leads_to'),
  (v_statistics, v_bayesian_statistics, 'leads_to'),
  (v_graph_theory, v_topology_intro, 'related_to'),
  (v_graph_theory, v_optimization, 'related_to'),
  (v_polar_coordinates, v_complex_analysis, 'leads_to'),
  (v_complex_numbers, v_complex_analysis, 'leads_to'),
  (v_parametric_equations, v_vector_calculus, 'leads_to'),
  (v_conic_sections, v_multivariable_calc, 'related_to'),

  -- ============================
  -- MATH: Advanced → Advanced (cross-links)
  -- ============================
  (v_multivariable_calc, v_vector_calculus, 'leads_to'),
  (v_multivariable_calc, v_partial_diff_eq, 'leads_to'),
  (v_multivariable_calc, v_tensor_calculus, 'leads_to'),
  (v_differential_eq, v_partial_diff_eq, 'leads_to'),
  (v_differential_eq, v_numerical_methods, 'related_to'),
  (v_fourier_analysis, v_partial_diff_eq, 'leads_to'),
  (v_linear_algebra, v_tensor_calculus, 'leads_to'),
  (v_linear_algebra, v_optimization, 'related_to'),
  (v_linear_algebra, v_numerical_methods, 'related_to'),
  (v_vector_calculus, v_tensor_calculus, 'leads_to'),
  (v_group_theory, v_topology_intro, 'related_to'),
  (v_stochastic_processes, v_bayesian_statistics, 'related_to'),

  -- ============================
  -- MATH: Advanced → Expert
  -- ============================
  (v_multivariable_calc, v_real_analysis, 'leads_to'),
  (v_vector_calculus, v_differential_geometry, 'leads_to'),
  (v_linear_algebra, v_abstract_algebra, 'leads_to'),
  (v_linear_algebra, v_functional_analysis, 'leads_to'),
  (v_group_theory, v_abstract_algebra, 'leads_to'),
  (v_topology_intro, v_algebraic_topology, 'leads_to'),
  (v_topology_intro, v_differential_geometry, 'leads_to'),
  (v_complex_analysis, v_functional_analysis, 'related_to'),
  (v_partial_diff_eq, v_functional_analysis, 'leads_to'),
  (v_differential_eq, v_real_analysis, 'related_to'),
  (v_fourier_analysis, v_functional_analysis, 'leads_to'),
  (v_bayesian_statistics, v_information_theory, 'leads_to'),
  (v_stochastic_processes, v_measure_theory, 'leads_to'),
  (v_optimization, v_game_theory, 'leads_to'),
  (v_tensor_calculus, v_differential_geometry, 'leads_to'),
  (v_numerical_methods, v_information_theory, 'related_to'),
  (v_real_analysis, v_measure_theory, 'leads_to'),
  (v_real_analysis, v_functional_analysis, 'leads_to'),
  (v_abstract_algebra, v_category_theory, 'leads_to'),
  (v_abstract_algebra, v_algebraic_topology, 'related_to'),
  (v_measure_theory, v_functional_analysis, 'related_to'),
  (v_differential_geometry, v_algebraic_topology, 'related_to'),

  -- ============================
  -- PHYSICS: Elementary → Foundational
  -- ============================
  (v_measurement, v_basic_motion, 'leads_to'),
  (v_measurement, v_density_buoyancy, 'leads_to'),
  (v_basic_motion, v_velocity, 'leads_to'),
  (v_basic_motion, v_kinematic_equations, 'leads_to'),
  (v_basic_motion, v_gravity, 'leads_to'),
  (v_states_of_matter, v_pressure, 'leads_to'),
  (v_states_of_matter, v_density_buoyancy, 'leads_to'),
  (v_temperature_heat, v_states_of_matter, 'related_to'),
  (v_temperature_heat, v_pressure, 'related_to'),
  (v_basic_electricity, v_electric_charge, 'leads_to'),
  (v_basic_electricity, v_dc_circuits, 'leads_to'),
  (v_light_basics, v_reflection_refraction, 'leads_to'),
  (v_sound_basics, v_simple_harmonic, 'leads_to'),

  -- ============================
  -- PHYSICS: Foundational → Foundational (cross-links)
  -- ============================
  (v_velocity, v_acceleration, 'leads_to'),
  (v_velocity, v_kinematic_equations, 'leads_to'),
  (v_acceleration, v_kinematic_equations, 'leads_to'),
  (v_acceleration, v_gravity, 'related_to'),
  (v_acceleration, v_projectile_motion, 'leads_to'),
  (v_gravity, v_projectile_motion, 'leads_to'),
  (v_kinematic_equations, v_projectile_motion, 'leads_to'),
  (v_pressure, v_density_buoyancy, 'related_to'),
  (v_electric_charge, v_dc_circuits, 'leads_to'),
  (v_friction, v_simple_machines, 'related_to'),

  -- ============================
  -- PHYSICS: Foundational → Intermediate
  -- ============================
  (v_acceleration, v_force, 'leads_to'),
  (v_gravity, v_force, 'leads_to'),
  (v_gravity, v_gravitation, 'leads_to'),
  (v_friction, v_force, 'leads_to'),
  (v_projectile_motion, v_circular_motion, 'related_to'),
  (v_kinematic_equations, v_force, 'leads_to'),
  (v_dc_circuits, v_electric_fields, 'leads_to'),
  (v_electric_charge, v_electric_fields, 'leads_to'),
  (v_reflection_refraction, v_geometric_optics, 'leads_to'),
  (v_density_buoyancy, v_fluid_mechanics, 'leads_to'),
  (v_pressure, v_fluid_mechanics, 'leads_to'),
  (v_simple_machines, v_work_power, 'leads_to'),

  -- ============================
  -- PHYSICS: Intermediate → Intermediate (cross-links)
  -- ============================
  (v_force, v_newtons_laws, 'leads_to'),
  (v_force, v_energy, 'leads_to'),
  (v_force, v_circular_motion, 'leads_to'),
  (v_force, v_work_power, 'leads_to'),
  (v_newtons_laws, v_energy, 'leads_to'),
  (v_newtons_laws, v_momentum, 'leads_to'),
  (v_newtons_laws, v_circular_motion, 'leads_to'),
  (v_newtons_laws, v_torque_rotation, 'leads_to'),
  (v_newtons_laws, v_gravitation, 'leads_to'),
  (v_energy, v_work_power, 'related_to'),
  (v_energy, v_collisions, 'related_to'),
  (v_momentum, v_collisions, 'leads_to'),
  (v_circular_motion, v_gravitation, 'related_to'),
  (v_circular_motion, v_torque_rotation, 'related_to'),
  (v_simple_harmonic, v_circular_motion, 'related_to'),
  (v_electric_fields, v_magnetic_fields, 'related_to'),

  -- ============================
  -- PHYSICS: Intermediate → Advanced
  -- ============================
  (v_energy, v_thermodynamics, 'leads_to'),
  (v_energy, v_waves, 'related_to'),
  (v_energy, v_lagrangian_mechanics, 'leads_to'),
  (v_momentum, v_waves, 'leads_to'),
  (v_momentum, v_lagrangian_mechanics, 'related_to'),
  (v_torque_rotation, v_lagrangian_mechanics, 'leads_to'),
  (v_torque_rotation, v_hamiltonian_mechanics, 'leads_to'),
  (v_simple_harmonic, v_waves, 'leads_to'),
  (v_fluid_mechanics, v_plasma_physics, 'leads_to'),
  (v_fluid_mechanics, v_thermodynamics, 'related_to'),
  (v_electric_fields, v_electromagnetism, 'leads_to'),
  (v_electric_fields, v_ac_circuits, 'leads_to'),
  (v_magnetic_fields, v_electromagnetism, 'leads_to'),
  (v_magnetic_fields, v_ac_circuits, 'leads_to'),
  (v_magnetic_fields, v_maxwells_equations, 'leads_to'),
  (v_geometric_optics, v_wave_optics, 'leads_to'),
  (v_gravitation, v_astrophysics, 'leads_to'),
  (v_gravitation, v_lagrangian_mechanics, 'related_to'),
  (v_collisions, v_nuclear_physics, 'related_to'),
  (v_work_power, v_thermodynamics, 'related_to'),
  (v_newtons_laws, v_lagrangian_mechanics, 'leads_to'),

  -- ============================
  -- PHYSICS: Advanced → Advanced (cross-links)
  -- ============================
  (v_electromagnetism, v_maxwells_equations, 'leads_to'),
  (v_electromagnetism, v_ac_circuits, 'related_to'),
  (v_thermodynamics, v_statistical_mechanics, 'leads_to'),
  (v_waves, v_wave_optics, 'leads_to'),
  (v_waves, v_ac_circuits, 'related_to'),
  (v_maxwells_equations, v_wave_optics, 'leads_to'),
  (v_lagrangian_mechanics, v_hamiltonian_mechanics, 'leads_to'),
  (v_statistical_mechanics, v_nuclear_physics, 'related_to'),
  (v_atomic_structure, v_semiconductor_physics, 'leads_to'),
  (v_atomic_structure, v_nuclear_physics, 'leads_to'),
  (v_nuclear_physics, v_astrophysics, 'leads_to'),
  (v_plasma_physics, v_astrophysics, 'related_to'),
  (v_maxwells_equations, v_plasma_physics, 'related_to'),

  -- ============================
  -- PHYSICS: Advanced → Expert
  -- ============================
  (v_waves, v_quantum_intro, 'leads_to'),
  (v_atomic_structure, v_quantum_intro, 'leads_to'),
  (v_electromagnetism, v_special_relativity, 'leads_to'),
  (v_maxwells_equations, v_special_relativity, 'leads_to'),
  (v_thermodynamics, v_special_relativity, 'related_to'),
  (v_hamiltonian_mechanics, v_quantum_intro, 'leads_to'),
  (v_lagrangian_mechanics, v_quantum_field_theory, 'leads_to'),
  (v_statistical_mechanics, v_condensed_matter, 'leads_to'),
  (v_nuclear_physics, v_particle_physics, 'leads_to'),
  (v_astrophysics, v_cosmology, 'leads_to'),
  (v_astrophysics, v_general_relativity, 'leads_to'),
  (v_semiconductor_physics, v_condensed_matter, 'leads_to'),
  (v_plasma_physics, v_quantum_field_theory, 'related_to'),

  -- ============================
  -- PHYSICS: Expert → Expert (cross-links)
  -- ============================
  (v_special_relativity, v_general_relativity, 'leads_to'),
  (v_special_relativity, v_quantum_field_theory, 'leads_to'),
  (v_quantum_intro, v_quantum_field_theory, 'leads_to'),
  (v_quantum_intro, v_quantum_computing, 'leads_to'),
  (v_quantum_intro, v_condensed_matter, 'leads_to'),
  (v_quantum_field_theory, v_particle_physics, 'leads_to'),
  (v_quantum_field_theory, v_string_theory, 'leads_to'),
  (v_general_relativity, v_cosmology, 'leads_to'),
  (v_general_relativity, v_string_theory, 'leads_to'),
  (v_particle_physics, v_cosmology, 'related_to'),
  (v_condensed_matter, v_quantum_computing, 'related_to'),

  -- ============================
  -- CROSS-SUBJECT: Math → Physics
  -- ============================
  -- Calculus → Kinematics/Dynamics
  (v_derivatives, v_velocity, 'application_of'),
  (v_derivatives, v_acceleration, 'application_of'),
  (v_integration, v_energy, 'application_of'),
  (v_integration, v_work_power, 'application_of'),
  (v_differential_eq, v_simple_harmonic, 'application_of'),
  (v_differential_eq, v_waves, 'application_of'),
  (v_differential_eq, v_dc_circuits, 'application_of'),
  (v_partial_diff_eq, v_waves, 'application_of'),
  (v_partial_diff_eq, v_thermodynamics, 'application_of'),
  (v_partial_diff_eq, v_maxwells_equations, 'application_of'),
  (v_multivariable_calc, v_electromagnetism, 'application_of'),
  (v_vector_calculus, v_maxwells_equations, 'application_of'),
  (v_vector_calculus, v_fluid_mechanics, 'application_of'),

  -- Linear Algebra → Physics
  (v_vectors, v_force, 'application_of'),
  (v_vectors, v_velocity, 'application_of'),
  (v_vectors, v_projectile_motion, 'application_of'),
  (v_matrices, v_quantum_intro, 'application_of'),
  (v_linear_algebra, v_quantum_intro, 'application_of'),
  (v_linear_algebra, v_special_relativity, 'application_of'),

  -- Trig → Physics
  (v_trigonometry, v_simple_harmonic, 'used_in'),
  (v_trigonometry, v_waves, 'used_in'),
  (v_trigonometry, v_projectile_motion, 'used_in'),
  (v_trigonometry, v_circular_motion, 'used_in'),
  (v_trigonometry, v_ac_circuits, 'used_in'),

  -- Advanced Math → Advanced Physics
  (v_fourier_analysis, v_waves, 'application_of'),
  (v_fourier_analysis, v_quantum_intro, 'application_of'),
  (v_fourier_analysis, v_ac_circuits, 'application_of'),
  (v_tensor_calculus, v_general_relativity, 'application_of'),
  (v_differential_geometry, v_general_relativity, 'application_of'),
  (v_group_theory, v_particle_physics, 'application_of'),
  (v_group_theory, v_condensed_matter, 'application_of'),
  (v_complex_numbers, v_ac_circuits, 'application_of'),
  (v_complex_numbers, v_quantum_intro, 'application_of'),
  (v_complex_analysis, v_quantum_field_theory, 'application_of'),
  (v_functional_analysis, v_quantum_intro, 'application_of'),
  (v_topology_intro, v_condensed_matter, 'application_of'),
  (v_algebraic_topology, v_string_theory, 'application_of'),
  (v_stochastic_processes, v_statistical_mechanics, 'application_of'),
  (v_probability_distributions, v_statistical_mechanics, 'application_of'),
  (v_optimization, v_lagrangian_mechanics, 'application_of'),
  (v_numerical_methods, v_fluid_mechanics, 'application_of'),
  (v_information_theory, v_quantum_computing, 'application_of'),
  (v_category_theory, v_quantum_field_theory, 'application_of'),
  (v_measure_theory, v_quantum_intro, 'application_of'),
  (v_exponents_logarithms, v_nuclear_physics, 'used_in'),
  (v_basic_probability, v_quantum_intro, 'used_in'),
  (v_statistics, v_statistical_mechanics, 'application_of'),
  (v_game_theory, v_quantum_computing, 'related_to');


-- ============================================================
-- PREREQUISITES — strict learning dependency chains
-- ============================================================
INSERT INTO prerequisites (node_id, prerequisite_node_id) VALUES
  -- Math elementary chains
  (v_fractions, v_basic_arithmetic),
  (v_decimals_percentages, v_basic_arithmetic),
  (v_order_of_operations, v_basic_arithmetic),
  (v_ratios_proportions, v_fractions),
  (v_number_line, v_basic_arithmetic),

  -- Math foundational prereqs
  (v_algebra, v_basic_arithmetic),
  (v_algebra, v_fractions),
  (v_algebra, v_order_of_operations),
  (v_functions, v_algebra),
  (v_trigonometry, v_basic_geometry),
  (v_trigonometry, v_algebra),
  (v_vectors, v_basic_geometry),
  (v_vectors, v_trigonometry),
  (v_exponents_logarithms, v_algebra),
  (v_inequalities, v_algebra),
  (v_sequences_series, v_algebra),
  (v_coordinate_geometry, v_algebra),
  (v_coordinate_geometry, v_basic_geometry),
  (v_sets_logic, v_basic_arithmetic),
  (v_complex_numbers, v_algebra),
  (v_complex_numbers, v_trigonometry),
  (v_combinatorics, v_basic_arithmetic),
  (v_combinatorics, v_algebra),
  (v_basic_probability, v_fractions),
  (v_basic_probability, v_combinatorics),
  (v_polynomials, v_algebra),

  -- Math intermediate prereqs
  (v_limits, v_functions),
  (v_limits, v_sequences_series),
  (v_derivatives, v_limits),
  (v_integration, v_derivatives),
  (v_matrices, v_vectors),
  (v_matrices, v_linear_systems),
  (v_statistics, v_basic_probability),
  (v_conic_sections, v_coordinate_geometry),
  (v_conic_sections, v_algebra),
  (v_polar_coordinates, v_trigonometry),
  (v_polar_coordinates, v_coordinate_geometry),
  (v_parametric_equations, v_functions),
  (v_parametric_equations, v_coordinate_geometry),
  (v_proof_techniques, v_sets_logic),
  (v_number_theory, v_algebra),
  (v_number_theory, v_proof_techniques),
  (v_linear_systems, v_algebra),
  (v_graph_theory, v_sets_logic),
  (v_probability_distributions, v_basic_probability),
  (v_probability_distributions, v_integration),

  -- Math advanced prereqs
  (v_differential_eq, v_derivatives),
  (v_differential_eq, v_integration),
  (v_multivariable_calc, v_integration),
  (v_multivariable_calc, v_vectors),
  (v_linear_algebra, v_matrices),
  (v_vector_calculus, v_multivariable_calc),
  (v_vector_calculus, v_vectors),
  (v_fourier_analysis, v_integration),
  (v_fourier_analysis, v_trigonometry),
  (v_partial_diff_eq, v_differential_eq),
  (v_partial_diff_eq, v_multivariable_calc),
  (v_numerical_methods, v_derivatives),
  (v_numerical_methods, v_matrices),
  (v_complex_analysis, v_complex_numbers),
  (v_complex_analysis, v_multivariable_calc),
  (v_group_theory, v_proof_techniques),
  (v_group_theory, v_sets_logic),
  (v_topology_intro, v_proof_techniques),
  (v_topology_intro, v_sets_logic),
  (v_bayesian_statistics, v_probability_distributions),
  (v_stochastic_processes, v_probability_distributions),
  (v_optimization, v_derivatives),
  (v_optimization, v_linear_algebra),
  (v_tensor_calculus, v_multivariable_calc),
  (v_tensor_calculus, v_linear_algebra),

  -- Math expert prereqs
  (v_real_analysis, v_limits),
  (v_real_analysis, v_proof_techniques),
  (v_abstract_algebra, v_group_theory),
  (v_measure_theory, v_real_analysis),
  (v_functional_analysis, v_real_analysis),
  (v_functional_analysis, v_linear_algebra),
  (v_differential_geometry, v_multivariable_calc),
  (v_differential_geometry, v_topology_intro),
  (v_algebraic_topology, v_topology_intro),
  (v_algebraic_topology, v_group_theory),
  (v_information_theory, v_basic_probability),
  (v_information_theory, v_exponents_logarithms),
  (v_game_theory, v_basic_probability),
  (v_game_theory, v_optimization),
  (v_category_theory, v_abstract_algebra),

  -- Physics elementary chains
  (v_basic_motion, v_measurement),
  (v_states_of_matter, v_measurement),
  (v_temperature_heat, v_measurement),

  -- Physics foundational prereqs
  (v_velocity, v_basic_motion),
  (v_acceleration, v_velocity),
  (v_gravity, v_basic_motion),
  (v_friction, v_gravity),
  (v_pressure, v_measurement),
  (v_density_buoyancy, v_measurement),
  (v_simple_machines, v_basic_motion),
  (v_projectile_motion, v_kinematic_equations),
  (v_projectile_motion, v_gravity),
  (v_electric_charge, v_basic_electricity),
  (v_dc_circuits, v_basic_electricity),
  (v_dc_circuits, v_electric_charge),
  (v_reflection_refraction, v_light_basics),
  (v_kinematic_equations, v_velocity),
  (v_kinematic_equations, v_acceleration),

  -- Physics intermediate prereqs
  (v_force, v_acceleration),
  (v_force, v_gravity),
  (v_newtons_laws, v_force),
  (v_energy, v_force),
  (v_momentum, v_newtons_laws),
  (v_circular_motion, v_force),
  (v_circular_motion, v_acceleration),
  (v_torque_rotation, v_force),
  (v_torque_rotation, v_circular_motion),
  (v_simple_harmonic, v_force),
  (v_fluid_mechanics, v_pressure),
  (v_fluid_mechanics, v_density_buoyancy),
  (v_geometric_optics, v_reflection_refraction),
  (v_electric_fields, v_electric_charge),
  (v_magnetic_fields, v_electric_fields),
  (v_work_power, v_force),
  (v_collisions, v_momentum),
  (v_collisions, v_energy),
  (v_gravitation, v_gravity),
  (v_gravitation, v_newtons_laws),

  -- Physics advanced prereqs
  (v_thermodynamics, v_energy),
  (v_thermodynamics, v_temperature_heat),
  (v_electromagnetism, v_electric_fields),
  (v_electromagnetism, v_magnetic_fields),
  (v_waves, v_simple_harmonic),
  (v_waves, v_energy),
  (v_wave_optics, v_waves),
  (v_wave_optics, v_geometric_optics),
  (v_ac_circuits, v_dc_circuits),
  (v_ac_circuits, v_electromagnetism),
  (v_maxwells_equations, v_electromagnetism),
  (v_maxwells_equations, v_magnetic_fields),
  (v_lagrangian_mechanics, v_energy),
  (v_lagrangian_mechanics, v_newtons_laws),
  (v_hamiltonian_mechanics, v_lagrangian_mechanics),
  (v_statistical_mechanics, v_thermodynamics),
  (v_nuclear_physics, v_atomic_structure),
  (v_atomic_structure, v_electric_fields),
  (v_atomic_structure, v_waves),
  (v_semiconductor_physics, v_atomic_structure),
  (v_plasma_physics, v_electromagnetism),
  (v_plasma_physics, v_thermodynamics),
  (v_astrophysics, v_gravitation),
  (v_astrophysics, v_nuclear_physics),

  -- Physics expert prereqs
  (v_quantum_intro, v_waves),
  (v_quantum_intro, v_atomic_structure),
  (v_quantum_intro, v_hamiltonian_mechanics),
  (v_special_relativity, v_electromagnetism),
  (v_special_relativity, v_maxwells_equations),
  (v_general_relativity, v_special_relativity),
  (v_quantum_field_theory, v_quantum_intro),
  (v_quantum_field_theory, v_special_relativity),
  (v_particle_physics, v_quantum_field_theory),
  (v_condensed_matter, v_quantum_intro),
  (v_condensed_matter, v_statistical_mechanics),
  (v_cosmology, v_general_relativity),
  (v_cosmology, v_astrophysics),
  (v_string_theory, v_quantum_field_theory),
  (v_string_theory, v_general_relativity),
  (v_quantum_computing, v_quantum_intro);


-- ============================================================
-- MASTERY TESTS (8 tests with 3 questions each)
-- ============================================================

-- 1. Basic Arithmetic Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_arithmetic, v_basic_arithmetic, 'Basic Arithmetic Test', 'Test your understanding of fundamental arithmetic operations.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_arithmetic, 'multiple_choice', 'What is the correct result of 3 + 4 × 2?', 'PEMDAS: Multiplication before Addition. 4 × 2 = 8, then 3 + 8 = 11.', 1),
(v_q2, v_test_arithmetic, 'short_answer', 'What is 144 ÷ 12?', '144 divided by 12 equals 12.', 2),
(v_q3, v_test_arithmetic, 'multiple_choice', 'Which property says a + b = b + a?', 'The commutative property.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, '11', true, 1), (v_q1, '14', false, 2), (v_q1, '10', false, 3), (v_q1, '7', false, 4),
(v_q3, 'Commutative property', true, 1), (v_q3, 'Associative property', false, 2), (v_q3, 'Distributive property', false, 3), (v_q3, 'Identity property', false, 4);

-- 2. Algebra Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_algebra, v_algebra, 'Algebra Mastery Test', 'Test your understanding of algebraic concepts.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_algebra, 'multiple_choice', 'Solve for x: 2x + 5 = 17', 'Subtract 5: 2x = 12. Divide by 2: x = 6.', 1),
(v_q2, v_test_algebra, 'short_answer', 'Factor: x² - 9', '(x + 3)(x - 3) — difference of squares.', 2),
(v_q3, v_test_algebra, 'multiple_choice', 'What is the slope in y = 3x - 7?', 'In y = mx + b, the slope m = 3.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, 'x = 6', true, 1), (v_q1, 'x = 11', false, 2), (v_q1, 'x = 7', false, 3), (v_q1, 'x = 4', false, 4),
(v_q3, '3', true, 1), (v_q3, '-7', false, 2), (v_q3, '7', false, 3), (v_q3, '-3', false, 4);

-- 3. Functions Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_functions, v_functions, 'Functions Mastery Test', 'Test your understanding of mathematical functions.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_functions, 'multiple_choice', 'What is a function?', 'A function assigns exactly one output to each input.', 1),
(v_q2, v_test_functions, 'short_answer', 'If f(x) = 2x + 3, what is f(5)?', 'f(5) = 2(5) + 3 = 13.', 2),
(v_q3, v_test_functions, 'multiple_choice', 'Which test determines if a graph is a function?', 'The vertical line test.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, 'A relation that assigns exactly one output to each input', true, 1), (v_q1, 'Any equation with two variables', false, 2), (v_q1, 'A relation where inputs have multiple outputs', false, 3), (v_q1, 'An equation that equals zero', false, 4),
(v_q3, 'Vertical line test', true, 1), (v_q3, 'Horizontal line test', false, 2), (v_q3, 'Origin test', false, 3), (v_q3, 'Symmetry test', false, 4);

-- 4. Trigonometry Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_trig, v_trigonometry, 'Trigonometry Mastery Test', 'Test your understanding of trigonometric concepts.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_trig, 'multiple_choice', 'What is sin(90°)?', 'sin(90°) = 1 from the unit circle.', 1),
(v_q2, v_test_trig, 'short_answer', 'What is the Pythagorean identity?', 'sin²θ + cos²θ = 1.', 2),
(v_q3, v_test_trig, 'multiple_choice', 'SOH-CAH-TOA: What is tan(θ)?', 'tan(θ) = opposite/adjacent.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, '1', true, 1), (v_q1, '0', false, 2), (v_q1, '√2/2', false, 3), (v_q1, '-1', false, 4),
(v_q3, 'opposite/adjacent', true, 1), (v_q3, 'adjacent/hypotenuse', false, 2), (v_q3, 'opposite/hypotenuse', false, 3), (v_q3, 'hypotenuse/opposite', false, 4);

-- 5. Derivatives Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_derivatives, v_derivatives, 'Derivatives Mastery Test', 'Test your understanding of differentiation.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_derivatives, 'multiple_choice', 'What is the derivative of f(x) = x³?', 'Power rule: d/dx(x³) = 3x².', 1),
(v_q2, v_test_derivatives, 'multiple_choice', 'What does a derivative represent geometrically?', 'The slope of the tangent line.', 2),
(v_q3, v_test_derivatives, 'short_answer', 'What is the derivative of 5x² + 3x - 7?', '10x + 3.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, '3x²', true, 1), (v_q1, 'x²', false, 2), (v_q1, '3x³', false, 3), (v_q1, '2x³', false, 4),
(v_q2, 'The slope of the tangent line', true, 1), (v_q2, 'The area under the curve', false, 2), (v_q2, 'The y-intercept', false, 3), (v_q2, 'The maximum value', false, 4);

-- 6. Velocity Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_velocity, v_velocity, 'Velocity Mastery Test', 'Test your understanding of velocity.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_velocity, 'multiple_choice', 'Key difference between speed and velocity?', 'Velocity includes direction.', 1),
(v_q2, v_test_velocity, 'short_answer', 'A car travels 150 km north in 2 hours. Average velocity?', '75 km/h north.', 2),
(v_q3, v_test_velocity, 'multiple_choice', 'Instantaneous velocity is defined as:', 'The derivative of position with respect to time.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, 'Velocity includes direction, speed does not', true, 1), (v_q1, 'Speed is always greater', false, 2), (v_q1, 'They are the same', false, 3), (v_q1, 'Velocity only applies to circular motion', false, 4),
(v_q3, 'The derivative of position w.r.t. time', true, 1), (v_q3, 'Total distance / total time', false, 2), (v_q3, 'The integral of acceleration', false, 3), (v_q3, 'Average of initial and final velocity', false, 4);

-- 7. Newton's Laws Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_newtons, v_newtons_laws, 'Newton''s Laws Test', 'Test your understanding of Newton''s three laws.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_newtons, 'multiple_choice', 'Newton''s First Law is the law of:', 'Inertia.', 1),
(v_q2, v_test_newtons, 'short_answer', 'F = ma: What force accelerates 5 kg at 3 m/s²?', '15 N.', 2),
(v_q3, v_test_newtons, 'multiple_choice', 'Which illustrates Newton''s Third Law?', 'Swimmer pushes water backward and moves forward.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, 'Inertia', true, 1), (v_q1, 'Acceleration', false, 2), (v_q1, 'Gravity', false, 3), (v_q1, 'Momentum', false, 4),
(v_q3, 'Swimmer pushes water backward and moves forward', true, 1), (v_q3, 'A ball rolling to a stop', false, 2), (v_q3, 'A heavier object falls faster', false, 3), (v_q3, 'An object at rest stays at rest', false, 4);

-- 8. Energy Test
v_q1 := uuid_generate_v4(); v_q2 := uuid_generate_v4(); v_q3 := uuid_generate_v4();
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_energy, v_energy, 'Energy Mastery Test', 'Test your understanding of energy concepts.', 70);
INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q1, v_test_energy, 'multiple_choice', 'What is the formula for kinetic energy?', 'KE = ½mv².', 1),
(v_q2, v_test_energy, 'short_answer', 'A 2 kg ball at 10 m height. What is its gravitational PE? (g=10)', '200 J (PE = mgh = 2×10×10).', 2),
(v_q3, v_test_energy, 'multiple_choice', 'What does conservation of energy state?', 'Energy cannot be created or destroyed, only transformed.', 3);
INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q1, '½mv²', true, 1), (v_q1, 'mv²', false, 2), (v_q1, 'mgh', false, 3), (v_q1, '½mv', false, 4),
(v_q3, 'Energy cannot be created or destroyed, only transformed', true, 1), (v_q3, 'Energy always increases over time', false, 2), (v_q3, 'Energy equals mass times velocity', false, 3), (v_q3, 'Potential energy is always conserved', false, 4);

END $$;
