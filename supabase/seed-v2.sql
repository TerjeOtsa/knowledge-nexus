-- =============================================
-- Knowledge Nexus - Expanded Seed Data v2
-- Radial tree: elementary → advanced
-- Math + Physics with basic starting nodes
-- =============================================
-- Run this AFTER clearing old data & schema.sql

-- Clear existing data (in dependency order)
TRUNCATE mastery_question_options, mastery_questions, mastery_tests,
         mastery_attempts, user_node_progress,
         prerequisites, edges, nodes, subjects
CASCADE;

DO $$
DECLARE
  -- Subject IDs
  v_sub_math UUID := uuid_generate_v4();
  v_sub_physics UUID := uuid_generate_v4();

  -- ===== MATH NODES (difficulty 1→5, elementary→advanced) =====
  -- Difficulty 1 — Elementary
  v_basic_arithmetic UUID := uuid_generate_v4();
  v_fractions UUID := uuid_generate_v4();
  v_basic_geometry UUID := uuid_generate_v4();
  -- Difficulty 2 — Foundational
  v_algebra UUID := uuid_generate_v4();
  v_functions UUID := uuid_generate_v4();
  v_trigonometry UUID := uuid_generate_v4();
  v_vectors UUID := uuid_generate_v4();
  -- Difficulty 3 — Intermediate
  v_limits UUID := uuid_generate_v4();
  v_derivatives UUID := uuid_generate_v4();
  v_integration UUID := uuid_generate_v4();
  v_matrices UUID := uuid_generate_v4();
  -- Difficulty 4 — Advanced
  v_differential_eq UUID := uuid_generate_v4();
  v_multivariable_calc UUID := uuid_generate_v4();
  v_linear_algebra UUID := uuid_generate_v4();
  -- Difficulty 5 — Expert
  v_real_analysis UUID := uuid_generate_v4();
  v_abstract_algebra UUID := uuid_generate_v4();

  -- ===== PHYSICS NODES (difficulty 1→5) =====
  -- Difficulty 1 — Elementary
  v_measurement UUID := uuid_generate_v4();
  v_basic_motion UUID := uuid_generate_v4();
  -- Difficulty 2 — Foundational
  v_velocity UUID := uuid_generate_v4();
  v_acceleration UUID := uuid_generate_v4();
  v_gravity UUID := uuid_generate_v4();
  -- Difficulty 3 — Intermediate
  v_force UUID := uuid_generate_v4();
  v_newtons_laws UUID := uuid_generate_v4();
  v_energy UUID := uuid_generate_v4();
  v_momentum UUID := uuid_generate_v4();
  -- Difficulty 4 — Advanced
  v_thermodynamics UUID := uuid_generate_v4();
  v_electromagnetism UUID := uuid_generate_v4();
  v_waves UUID := uuid_generate_v4();
  -- Difficulty 5 — Expert
  v_quantum_intro UUID := uuid_generate_v4();
  v_special_relativity UUID := uuid_generate_v4();

  -- Test IDs
  v_test_arithmetic UUID := uuid_generate_v4();
  v_test_functions UUID := uuid_generate_v4();
  v_test_derivatives UUID := uuid_generate_v4();
  v_test_velocity UUID := uuid_generate_v4();
  v_test_newtons UUID := uuid_generate_v4();
  -- Question IDs
  v_q_arith_1 UUID := uuid_generate_v4();
  v_q_arith_2 UUID := uuid_generate_v4();
  v_q_arith_3 UUID := uuid_generate_v4();
  v_q_func_1 UUID := uuid_generate_v4();
  v_q_func_2 UUID := uuid_generate_v4();
  v_q_func_3 UUID := uuid_generate_v4();
  v_q_deriv_1 UUID := uuid_generate_v4();
  v_q_deriv_2 UUID := uuid_generate_v4();
  v_q_deriv_3 UUID := uuid_generate_v4();
  v_q_vel_1 UUID := uuid_generate_v4();
  v_q_vel_2 UUID := uuid_generate_v4();
  v_q_vel_3 UUID := uuid_generate_v4();
  v_q_newton_1 UUID := uuid_generate_v4();
  v_q_newton_2 UUID := uuid_generate_v4();
  v_q_newton_3 UUID := uuid_generate_v4();
BEGIN

-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO subjects (id, name, color, description, icon) VALUES
  (v_sub_math,    'Mathematics', '#3b82f6', 'The study of numbers, quantity, structure, space, and change.', '📐'),
  (v_sub_physics, 'Physics',     '#8b5cf6', 'The natural science that studies matter, energy, and their interactions.', '⚛️');

-- ============================================================
-- MATH NODES
-- ============================================================

-- Difficulty 1 — Elementary
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_basic_arithmetic, 'Basic Arithmetic', 'basic-arithmetic', v_sub_math, 'Number Theory',
 'The four fundamental operations: addition, subtraction, multiplication, and division. Includes understanding of integers, decimals, order of operations (PEMDAS/BODMAS), and basic number properties (commutative, associative, distributive).',
 'Arithmetic is the absolute foundation of all mathematics. Every branch — from algebra to calculus to statistics — is built on these operations.',
 ARRAY['Everyday calculations (shopping, budgeting)', 'Cooking measurements', 'Time and distance estimation', 'Foundation for all higher math'], 1, 0, 0),

(v_fractions, 'Fractions & Ratios', 'fractions-ratios', v_sub_math, 'Number Theory',
 'A fraction represents a part of a whole, written as a/b. Operations include addition (common denominator), multiplication, division (invert and multiply). Ratios compare two quantities. Percentages are fractions of 100.',
 'Fractions appear everywhere in daily life and are essential for understanding proportions, probability, and rational numbers in higher math.',
 ARRAY['Cooking recipes and proportions', 'Financial calculations (interest rates, tax)', 'Probability and statistics', 'Music theory (time signatures)'], 1, 0, 0),

(v_basic_geometry, 'Basic Geometry', 'basic-geometry', v_sub_math, 'Geometry',
 'The study of shapes, angles, areas, and volumes. Includes points, lines, rays, triangles, rectangles, circles. Key formulas: area of rectangle (l×w), area of triangle (½bh), circumference (2πr), area of circle (πr²).',
 'Geometry develops spatial reasoning and is used in art, architecture, engineering, navigation, and computer graphics.',
 ARRAY['Architecture and construction', 'Art and design', 'Navigation and map reading', 'Computer graphics and game design'], 1, 0, 0);

-- Difficulty 2 — Foundational
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_algebra, 'Algebra', 'algebra', v_sub_math, 'Algebra',
 'Algebra introduces variables and equations. You learn to solve for unknowns, work with expressions, factor polynomials, and understand the concept of equality. Linear equations (y = mx + b) and quadratic equations (ax² + bx + c = 0) are central.',
 'Algebra is the gateway to all advanced mathematics. It teaches abstract thinking and problem-solving that applies to every STEM field.',
 ARRAY['Solving real-world problems with unknowns', 'Programming and algorithms', 'Economics and business modeling', 'Science experiments and data analysis'], 2, 0, 0),

(v_functions, 'Functions', 'functions', v_sub_math, 'Algebra',
 'A function is a relation that assigns exactly one output value to each input value. Written as f(x), it maps elements from a domain to a codomain. Functions can be linear, quadratic, polynomial, exponential, logarithmic, and more.',
 'Functions are the fundamental building block of all mathematics and science. Every equation you write, every model you build, and every algorithm you code is essentially a function.',
 ARRAY['Modeling real-world relationships', 'Programming and software development', 'Data analysis and machine learning', 'Engineering calculations'], 2, 0, 0),

(v_trigonometry, 'Trigonometry', 'trigonometry', v_sub_math, 'Geometry',
 'Trigonometry studies the relationships between angles and sides of triangles. The six trigonometric functions (sin, cos, tan, csc, sec, cot) relate angles to ratios. Key identities include Pythagorean, double-angle, and sum/difference formulas.',
 'Trigonometry is used everywhere: physics (waves, oscillations), engineering (signal processing), navigation, astronomy, and music theory.',
 ARRAY['Analyzing waves and oscillations', 'Structural engineering', 'Navigation and surveying', 'Audio and signal processing'], 2, 0, 0),

(v_vectors, 'Vectors', 'vectors', v_sub_math, 'Linear Algebra',
 'A vector is a mathematical object with both magnitude and direction. Vectors can be added, scaled, and multiplied (dot product, cross product). They form the basis of linear algebra and are represented as ordered lists of numbers.',
 'Vectors are the language of physics and engineering. Forces, velocities, and fields are all vectors. They''re fundamental in computer graphics, ML, and data science.',
 ARRAY['Representing forces in physics', '3D graphics and game development', 'Machine learning feature vectors', 'Navigation and GPS'], 2, 0, 0);

-- Difficulty 3 — Intermediate
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_limits, 'Limits', 'limits', v_sub_math, 'Calculus',
 'A limit describes what value a function approaches as the input approaches some value. It is the foundational concept of calculus, allowing us to reason about behavior near a point without requiring the function to actually reach that point.',
 'Limits bridge algebra and calculus. They let us define derivatives and integrals with mathematical precision.',
 ARRAY['Defining derivatives and integrals', 'Analyzing discontinuities', 'Infinite series', 'Signal processing'], 3, 0, 0),

(v_derivatives, 'Derivatives', 'derivatives', v_sub_math, 'Calculus',
 'The derivative measures the instantaneous rate of change of a function. Formally defined as the limit of the difference quotient. Key rules: power rule, product rule, quotient rule, chain rule.',
 'Derivatives are central to optimization, physics (velocity/acceleration), economics (marginal cost), and machine learning (gradient descent).',
 ARRAY['Finding velocity from position', 'Optimization (maximize profit, minimize cost)', 'Machine learning gradient descent', 'Curve sketching'], 3, 0, 0),

(v_integration, 'Integration', 'integration', v_sub_math, 'Calculus',
 'Integration is the reverse of differentiation. The definite integral calculates accumulated area under a curve. The indefinite integral finds antiderivatives. Techniques: substitution, integration by parts, partial fractions.',
 'Integration lets you calculate total quantities from rates: distance from velocity, work from force, probability from density.',
 ARRAY['Areas and volumes', 'Work done by a force', 'Probability distributions', 'Signal processing'], 3, 0, 0),

(v_matrices, 'Matrices', 'matrices', v_sub_math, 'Linear Algebra',
 'A matrix is a rectangular array of numbers arranged in rows and columns. Operations include addition, multiplication, transpose, and inverse. Determinants measure scaling factors. Eigenvalues/eigenvectors reveal fundamental transformations.',
 'Matrices are essential in computer graphics (transformations), machine learning (data representation), quantum mechanics, and solving systems of equations.',
 ARRAY['Computer graphics transformations', '3D rotations and projections', 'Solving systems of equations', 'Machine learning and neural networks'], 3, 0, 0);

-- Difficulty 4 — Advanced
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_differential_eq, 'Differential Equations', 'differential-equations', v_sub_math, 'Calculus',
 'A differential equation relates a function to its derivatives. ODEs involve one variable; PDEs involve multiple. Solution methods: separation of variables, integrating factors, Laplace transforms. Models dynamic systems.',
 'Differential equations describe how things change over time — population growth, radioactive decay, circuit behavior, fluid flow, and more.',
 ARRAY['Modeling population growth', 'Electrical circuit analysis', 'Fluid dynamics', 'Control systems engineering'], 4, 0, 0),

(v_multivariable_calc, 'Multivariable Calculus', 'multivariable-calculus', v_sub_math, 'Calculus',
 'Extends calculus to functions of several variables. Partial derivatives, gradient vectors, multiple integrals, line integrals, surface integrals. Key theorems: Green''s, Stokes'', and the Divergence theorem.',
 'Most real-world systems depend on multiple variables simultaneously. Multivariable calculus is essential for physics, engineering, and advanced data science.',
 ARRAY['Electromagnetic field analysis', 'Fluid flow computation', 'Optimization in ML (multi-parameter)', 'Weather modeling'], 4, 0, 0),

(v_linear_algebra, 'Advanced Linear Algebra', 'advanced-linear-algebra', v_sub_math, 'Linear Algebra',
 'Deep study of vector spaces, linear transformations, eigenspaces, diagonalization, SVD (Singular Value Decomposition), and inner product spaces. Abstract treatment with proofs.',
 'Advanced linear algebra is the backbone of machine learning, quantum computing, signal processing, and modern data science.',
 ARRAY['Principal Component Analysis (PCA)', 'Quantum computing operations', 'Recommendation systems', 'Image compression (SVD)'], 4, 0, 0);

-- Difficulty 5 — Expert
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_real_analysis, 'Real Analysis', 'real-analysis', v_sub_math, 'Analysis',
 'Rigorous foundations of calculus. Formal ε-δ definitions of limits, continuity, differentiability. Studies sequences, series, convergence, metric spaces, and measure theory. Proofs are central.',
 'Real analysis provides the rigorous foundation that makes all of applied mathematics trustworthy. Essential for graduate-level math and theoretical research.',
 ARRAY['Foundations for probability theory', 'Theoretical machine learning proofs', 'Functional analysis', 'Mathematical physics'], 5, 0, 0),

(v_abstract_algebra, 'Abstract Algebra', 'abstract-algebra', v_sub_math, 'Algebra',
 'Studies algebraic structures: groups, rings, fields, and their homomorphisms. Explores symmetry, permutations, polynomial rings, and Galois theory. Highly abstract and proof-based.',
 'Abstract algebra underpins cryptography (RSA, elliptic curves), coding theory, physics (symmetry groups), and theoretical computer science.',
 ARRAY['Cryptography (RSA, ECC)', 'Error-correcting codes', 'Particle physics symmetry groups', 'Computer science type theory'], 5, 0, 0);

-- ============================================================
-- PHYSICS NODES
-- ============================================================

-- Difficulty 1 — Elementary
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_measurement, 'Measurement & Units', 'measurement-units', v_sub_physics, 'Foundations',
 'Physics begins with measurement. SI units (meters, kilograms, seconds, Kelvin, Ampere, mole, candela). Scientific notation, significant figures, dimensional analysis, and unit conversions.',
 'You cannot do physics without measuring things properly. Dimensional analysis catches errors before they become disasters (like the Mars Climate Orbiter crash).',
 ARRAY['Laboratory experiments', 'Engineering specifications', 'Quality control in manufacturing', 'Scientific research methodology'], 1, 0, 0),

(v_basic_motion, 'Basic Motion', 'basic-motion', v_sub_physics, 'Kinematics',
 'Understanding that objects move through space over time. Concepts of position, distance, displacement, speed. Describing motion with words, graphs (position-time, distance-time), and simple equations.',
 'Motion is the most fundamental observable phenomenon in physics. Understanding it intuitively prepares you for the mathematical treatment in kinematics.',
 ARRAY['Sports analytics', 'Traffic and transportation', 'Animation and filmmaking', 'Everyday motion prediction'], 1, 0, 0);

-- Difficulty 2 — Foundational
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_velocity, 'Velocity', 'velocity', v_sub_physics, 'Kinematics',
 'Velocity is the rate of change of position with respect to time. It is a vector with magnitude (speed) and direction. Average velocity = displacement/time. Instantaneous velocity is the derivative of position.',
 'Understanding velocity connects everyday experience of motion to calculus, and is essential for all of mechanics.',
 ARRAY['Predicting trajectories', 'Vehicle dynamics', 'Sports analytics', 'Space mission planning'], 2, 0, 0),

(v_acceleration, 'Acceleration', 'acceleration', v_sub_physics, 'Kinematics',
 'Acceleration is the rate of change of velocity with respect to time — the second derivative of position. Constant acceleration leads to the kinematic equations: v = v₀ + at, x = x₀ + v₀t + ½at².',
 'Acceleration is the bridge between forces and motion. It explains why objects speed up, slow down, or change direction.',
 ARRAY['Vehicle braking calculations', 'Roller coaster design', 'Rocket propulsion', 'Earthquake engineering'], 2, 0, 0),

(v_gravity, 'Gravity', 'gravity', v_sub_physics, 'Dynamics',
 'Gravity is the universal attractive force between masses. Near Earth: g ≈ 9.8 m/s². Newton''s law of universal gravitation: F = Gm₁m₂/r². Causes free-fall, projectile motion, and orbital mechanics.',
 'Gravity is one of the four fundamental forces. Understanding it is essential for space exploration, engineering, and cosmology.',
 ARRAY['Satellite orbit calculations', 'Building and bridge design', 'Tidal prediction', 'Understanding black holes'], 2, 0, 0);

-- Difficulty 3 — Intermediate
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_force, 'Force', 'force', v_sub_physics, 'Dynamics',
 'A force is a push or pull that can change motion. Measured in Newtons (N). Types: gravitational, electromagnetic, friction, tension, normal, applied. Net force determines acceleration via F = ma.',
 'Force is one of the most fundamental concepts in physics. Understanding forces lets you analyze everything from bridges to biological systems.',
 ARRAY['Structural engineering', 'Mechanical design', 'Biomechanics', 'Aerospace engineering'], 3, 0, 0),

(v_newtons_laws, 'Newton''s Laws of Motion', 'newtons-laws', v_sub_physics, 'Dynamics',
 'Three laws: (1) Inertia — objects maintain their state of motion. (2) F = ma — force equals mass times acceleration. (3) Action-reaction — every force has an equal opposite force.',
 'Newton''s laws are the foundation of classical mechanics. They predict motion of everything from projectiles to planets.',
 ARRAY['Vehicle crash safety', 'Orbital mechanics', 'Sports physics', 'Industrial machinery'], 3, 0, 0),

(v_energy, 'Energy', 'energy', v_sub_physics, 'Mechanics',
 'Energy is the capacity to do work. Forms: kinetic (½mv²), potential (mgh), thermal, chemical, electrical, nuclear. Conservation of energy: total energy in an isolated system remains constant.',
 'Energy conservation is one of the most powerful principles in all of physics, simplifying problems that would be very difficult with forces alone.',
 ARRAY['Power generation', 'Renewable energy engineering', 'Thermodynamic analysis', 'Climate science'], 3, 0, 0),

(v_momentum, 'Momentum', 'momentum', v_sub_physics, 'Mechanics',
 'Linear momentum p = mv is a vector quantity. Conservation of momentum: in the absence of external forces, total momentum is conserved. Central to collision analysis (elastic and inelastic).',
 'Momentum conservation is fundamental to understanding collisions, explosions, rocket propulsion, and particle physics.',
 ARRAY['Vehicle collision analysis', 'Rocket propulsion', 'Billiards and sports physics', 'Particle physics experiments'], 3, 0, 0);

-- Difficulty 4 — Advanced
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_thermodynamics, 'Thermodynamics', 'thermodynamics', v_sub_physics, 'Thermal Physics',
 'Study of heat, work, temperature, and energy transfer. Four laws: zeroth (thermal equilibrium), first (conservation of energy), second (entropy always increases), third (absolute zero is unreachable). Introduces entropy and the Carnot cycle.',
 'Thermodynamics governs engines, refrigerators, chemical reactions, stars, and even the arrow of time in the universe.',
 ARRAY['Engine and power plant design', 'Refrigeration and HVAC', 'Chemical process engineering', 'Understanding the heat death of the universe'], 4, 0, 0),

(v_electromagnetism, 'Electromagnetism', 'electromagnetism', v_sub_physics, 'E&M',
 'Unified theory of electric and magnetic forces. Coulomb''s law, electric fields, magnetic fields, Faraday''s law of induction, Maxwell''s equations. Light is an electromagnetic wave.',
 'Electromagnetism explains electricity, magnetism, light, radio, and is the force behind all of modern technology.',
 ARRAY['Electric power generation', 'Wireless communication', 'Medical imaging (MRI)', 'Semiconductor design'], 4, 0, 0),

(v_waves, 'Waves & Oscillations', 'waves-oscillations', v_sub_physics, 'Wave Physics',
 'Oscillations are periodic back-and-forth motion (simple harmonic, damped, driven). Waves transfer energy through a medium or space. Properties: wavelength, frequency, amplitude, speed. Superposition, interference, diffraction, standing waves.',
 'Waves describe sound, light, water waves, earthquakes, and quantum particles. Understanding waves is essential for music, optics, communications, and quantum mechanics.',
 ARRAY['Audio engineering and acoustics', 'Optical fiber communication', 'Earthquake seismology', 'Quantum wave functions'], 4, 0, 0);

-- Difficulty 5 — Expert
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
(v_quantum_intro, 'Introduction to Quantum Mechanics', 'quantum-mechanics-intro', v_sub_physics, 'Quantum',
 'Quantum mechanics describes physics at atomic and subatomic scales. Key concepts: wave-particle duality, Heisenberg uncertainty principle, Schrödinger equation, quantization of energy, superposition, and entanglement.',
 'Quantum mechanics is the most successful physical theory ever. It explains chemistry, semiconductors, lasers, and is the basis for quantum computing.',
 ARRAY['Semiconductor design', 'Laser technology', 'Quantum computing', 'Understanding chemical bonding'], 5, 0, 0),

(v_special_relativity, 'Special Relativity', 'special-relativity', v_sub_physics, 'Relativity',
 'Einstein''s theory for objects moving at high speeds. Two postulates: (1) laws of physics are the same in all inertial frames, (2) the speed of light is constant. Consequences: time dilation, length contraction, E = mc².',
 'Special relativity fundamentally changed our understanding of space, time, and energy. It''s essential for particle physics, GPS satellites, and nuclear energy.',
 ARRAY['GPS satellite corrections', 'Particle accelerator design', 'Nuclear energy calculations', 'Astrophysics and cosmology'], 5, 0, 0);

-- ============================================================
-- EDGES (Learning paths / relationships)
-- ============================================================
INSERT INTO edges (source_node_id, target_node_id, relationship_type) VALUES
  -- Math: elementary → foundational
  (v_basic_arithmetic, v_fractions, 'leads_to'),
  (v_basic_arithmetic, v_algebra, 'leads_to'),
  (v_fractions, v_algebra, 'leads_to'),
  (v_basic_geometry, v_trigonometry, 'leads_to'),
  (v_basic_geometry, v_vectors, 'leads_to'),
  (v_algebra, v_functions, 'leads_to'),
  -- Math: foundational → intermediate
  (v_functions, v_limits, 'leads_to'),
  (v_functions, v_matrices, 'related_to'),
  (v_trigonometry, v_limits, 'used_in'),
  (v_trigonometry, v_vectors, 'related_to'),
  (v_limits, v_derivatives, 'leads_to'),
  (v_derivatives, v_integration, 'related_to'),
  (v_vectors, v_matrices, 'leads_to'),
  -- Math: intermediate → advanced
  (v_derivatives, v_differential_eq, 'leads_to'),
  (v_integration, v_differential_eq, 'leads_to'),
  (v_integration, v_multivariable_calc, 'leads_to'),
  (v_derivatives, v_multivariable_calc, 'leads_to'),
  (v_matrices, v_linear_algebra, 'leads_to'),
  -- Math: advanced → expert
  (v_multivariable_calc, v_real_analysis, 'leads_to'),
  (v_linear_algebra, v_abstract_algebra, 'leads_to'),
  (v_differential_eq, v_real_analysis, 'related_to'),

  -- Physics: elementary → foundational
  (v_measurement, v_basic_motion, 'leads_to'),
  (v_basic_motion, v_velocity, 'leads_to'),
  (v_velocity, v_acceleration, 'leads_to'),
  (v_basic_motion, v_gravity, 'related_to'),
  -- Physics: foundational → intermediate
  (v_acceleration, v_force, 'leads_to'),
  (v_gravity, v_force, 'explains'),
  (v_force, v_newtons_laws, 'leads_to'),
  (v_force, v_energy, 'related_to'),
  (v_newtons_laws, v_energy, 'leads_to'),
  (v_newtons_laws, v_momentum, 'leads_to'),
  -- Physics: intermediate → advanced
  (v_energy, v_thermodynamics, 'leads_to'),
  (v_energy, v_waves, 'related_to'),
  (v_force, v_electromagnetism, 'related_to'),
  (v_momentum, v_waves, 'leads_to'),
  -- Physics: advanced → expert
  (v_waves, v_quantum_intro, 'leads_to'),
  (v_electromagnetism, v_quantum_intro, 'related_to'),
  (v_electromagnetism, v_special_relativity, 'leads_to'),
  (v_thermodynamics, v_special_relativity, 'related_to'),

  -- Cross-subject connections
  (v_derivatives, v_velocity, 'application_of'),
  (v_derivatives, v_acceleration, 'application_of'),
  (v_integration, v_energy, 'application_of'),
  (v_vectors, v_force, 'application_of'),
  (v_differential_eq, v_waves, 'application_of'),
  (v_linear_algebra, v_quantum_intro, 'application_of'),
  (v_trigonometry, v_waves, 'used_in');

-- ============================================================
-- PREREQUISITES (strict prerequisite chains)
-- ============================================================
INSERT INTO prerequisites (node_id, prerequisite_node_id) VALUES
  -- Math chains
  (v_fractions, v_basic_arithmetic),
  (v_algebra, v_basic_arithmetic),
  (v_algebra, v_fractions),
  (v_functions, v_algebra),
  (v_trigonometry, v_basic_geometry),
  (v_vectors, v_basic_geometry),
  (v_limits, v_functions),
  (v_derivatives, v_limits),
  (v_integration, v_derivatives),
  (v_matrices, v_vectors),
  (v_differential_eq, v_derivatives),
  (v_differential_eq, v_integration),
  (v_multivariable_calc, v_integration),
  (v_linear_algebra, v_matrices),
  (v_real_analysis, v_multivariable_calc),
  (v_abstract_algebra, v_linear_algebra),
  -- Physics chains
  (v_basic_motion, v_measurement),
  (v_velocity, v_basic_motion),
  (v_acceleration, v_velocity),
  (v_force, v_acceleration),
  (v_newtons_laws, v_force),
  (v_energy, v_force),
  (v_momentum, v_newtons_laws),
  (v_thermodynamics, v_energy),
  (v_electromagnetism, v_force),
  (v_waves, v_energy),
  (v_quantum_intro, v_waves),
  (v_special_relativity, v_electromagnetism);

-- ============================================================
-- MASTERY TESTS
-- ============================================================

-- Basic Arithmetic test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_arithmetic, v_basic_arithmetic, 'Basic Arithmetic Test', 'Test your understanding of fundamental arithmetic operations.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q_arith_1, v_test_arithmetic, 'multiple_choice', 'What is the correct order of operations for: 3 + 4 × 2?', 'PEMDAS: Multiplication before Addition. 4 × 2 = 8, then 3 + 8 = 11.', 1),
(v_q_arith_2, v_test_arithmetic, 'short_answer', 'What is 144 ÷ 12?', '144 divided by 12 equals 12.', 2),
(v_q_arith_3, v_test_arithmetic, 'multiple_choice', 'Which property says a + b = b + a?', 'The commutative property states that the order of addition (or multiplication) does not change the result.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_arith_1, '11', true, 1),
(v_q_arith_1, '14', false, 2),
(v_q_arith_1, '10', false, 3),
(v_q_arith_1, '7', false, 4),
(v_q_arith_3, 'Commutative property', true, 1),
(v_q_arith_3, 'Associative property', false, 2),
(v_q_arith_3, 'Distributive property', false, 3),
(v_q_arith_3, 'Identity property', false, 4);

-- Functions test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_functions, v_functions, 'Functions Mastery Test', 'Test your understanding of mathematical functions.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q_func_1, v_test_functions, 'multiple_choice', 'What is a function in mathematics?', 'A function assigns exactly one output to each input.', 1),
(v_q_func_2, v_test_functions, 'short_answer', 'If f(x) = 2x + 3, what is f(5)?', 'f(5) = 2(5) + 3 = 13.', 2),
(v_q_func_3, v_test_functions, 'multiple_choice', 'Which is NOT a type of function?', 'Circular is not a standard function type.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_func_1, 'A relation that assigns exactly one output to each input', true, 1),
(v_q_func_1, 'Any equation with two variables', false, 2),
(v_q_func_1, 'A relation where inputs can have multiple outputs', false, 3),
(v_q_func_1, 'An equation that always equals zero', false, 4),
(v_q_func_3, 'Linear', false, 1),
(v_q_func_3, 'Quadratic', false, 2),
(v_q_func_3, 'Circular', true, 3),
(v_q_func_3, 'Exponential', false, 4);

-- Derivatives test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_derivatives, v_derivatives, 'Derivatives Mastery Test', 'Test your understanding of differentiation.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q_deriv_1, v_test_derivatives, 'multiple_choice', 'What is the derivative of f(x) = x³?', 'Power rule: d/dx(x³) = 3x².', 1),
(v_q_deriv_2, v_test_derivatives, 'multiple_choice', 'What does a derivative represent geometrically?', 'The slope of the tangent line at a point.', 2),
(v_q_deriv_3, v_test_derivatives, 'short_answer', 'What is the derivative of 5x² + 3x - 7?', '10x + 3.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_deriv_1, '3x²', true, 1),
(v_q_deriv_1, 'x²', false, 2),
(v_q_deriv_1, '3x³', false, 3),
(v_q_deriv_1, '2x³', false, 4),
(v_q_deriv_2, 'The area under the curve', false, 1),
(v_q_deriv_2, 'The slope of the tangent line', true, 2),
(v_q_deriv_2, 'The y-intercept', false, 3),
(v_q_deriv_2, 'The maximum value', false, 4);

-- Velocity test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_velocity, v_velocity, 'Velocity Mastery Test', 'Test your understanding of velocity and motion.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q_vel_1, v_test_velocity, 'multiple_choice', 'What is the key difference between speed and velocity?', 'Velocity includes direction; speed does not.', 1),
(v_q_vel_2, v_test_velocity, 'short_answer', 'A car travels 150 km north in 2 hours. What is its average velocity?', '75 km/h north.', 2),
(v_q_vel_3, v_test_velocity, 'multiple_choice', 'Instantaneous velocity is defined as:', 'The derivative of position with respect to time.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_vel_1, 'Velocity includes direction, speed does not', true, 1),
(v_q_vel_1, 'Speed is always greater', false, 2),
(v_q_vel_1, 'They are the same', false, 3),
(v_q_vel_1, 'Velocity only applies to circular motion', false, 4),
(v_q_vel_3, 'Total distance / total time', false, 1),
(v_q_vel_3, 'The derivative of position with respect to time', true, 2),
(v_q_vel_3, 'The integral of acceleration', false, 3),
(v_q_vel_3, 'Average of initial and final velocity', false, 4);

-- Newton's Laws test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
(v_test_newtons, v_newtons_laws, 'Newton''s Laws Test', 'Test your understanding of Newton''s three laws.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
(v_q_newton_1, v_test_newtons, 'multiple_choice', 'Newton''s First Law is the law of:', 'Inertia — an object maintains its state of motion unless acted on by a net force.', 1),
(v_q_newton_2, v_test_newtons, 'short_answer', 'F = ma: What force accelerates 5 kg at 3 m/s²?', '15 N.', 2),
(v_q_newton_3, v_test_newtons, 'multiple_choice', 'Which illustrates Newton''s Third Law?', 'Swimmer pushes water backward, water pushes swimmer forward.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_newton_1, 'Inertia', true, 1),
(v_q_newton_1, 'Acceleration', false, 2),
(v_q_newton_1, 'Gravity', false, 3),
(v_q_newton_1, 'Momentum', false, 4),
(v_q_newton_3, 'A ball rolling to a stop', false, 1),
(v_q_newton_3, 'Swimmer pushes water backward and moves forward', true, 2),
(v_q_newton_3, 'A heavier object falls faster', false, 3),
(v_q_newton_3, 'An object at rest stays at rest', false, 4);

END $$;
