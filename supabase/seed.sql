-- =============================================
-- Knowledge Nexus - Seed Data
-- Math + Physics starter knowledge graph
-- =============================================
-- Run this AFTER schema.sql

-- ---- Subjects ----
INSERT INTO subjects (id, name, color, description, icon) VALUES
  ('sub_math', 'Mathematics', '#3b82f6', 'The study of numbers, quantity, structure, space, and change.', '📐'),
  ('sub_physics', 'Physics', '#8b5cf6', 'The natural science that studies matter, energy, and their interactions.', '⚛️');

-- ---- Nodes (Mathematics) ----
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (
    'node_functions',
    'Functions',
    'functions',
    'sub_math',
    'Algebra',
    'A function is a relation that assigns exactly one output value to each input value. Written as f(x), it maps elements from a domain to a codomain. Functions can be linear, quadratic, polynomial, exponential, logarithmic, and more.',
    'Functions are the fundamental building block of all mathematics and science. Every equation you write, every model you build, and every algorithm you code is essentially a function. Understanding functions unlocks the entire world of calculus, physics, and engineering.',
    '["Modeling real-world relationships (cost vs quantity, distance vs time)", "Programming and software development", "Data analysis and machine learning", "Engineering calculations"]',
    1,
    200, 100
  ),
  (
    'node_limits',
    'Limits',
    'limits',
    'sub_math',
    'Calculus',
    'A limit describes what value a function approaches as the input approaches some value. It is the foundational concept of calculus, allowing us to reason about behavior near a point without requiring the function to actually reach that point.',
    'Limits bridge the gap between algebra and calculus. They let us define derivatives (instantaneous rates of change) and integrals (accumulated quantities) with mathematical precision. Without limits, modern physics and engineering would be impossible.',
    '["Defining derivatives and integrals", "Analyzing function behavior near discontinuities", "Evaluating infinite series", "Signal processing"]',
    2,
    400, 100
  ),
  (
    'node_derivatives',
    'Derivatives',
    'derivatives',
    'sub_math',
    'Calculus',
    'The derivative of a function measures its instantaneous rate of change at any given point. Formally defined as the limit of the difference quotient, it tells you the slope of the tangent line to the function''s graph. Key rules include power rule, product rule, quotient rule, and chain rule.',
    'Derivatives are central to optimization, physics (velocity, acceleration), economics (marginal cost/revenue), and machine learning (gradient descent). If you want to find maxima, minima, or understand how things change, you need derivatives.',
    '["Finding velocity and acceleration from position", "Optimization problems (maximize profit, minimize cost)", "Machine learning gradient descent", "Curve sketching and analysis"]',
    3,
    600, 100
  ),
  (
    'node_integration',
    'Integration',
    'integration',
    'sub_math',
    'Calculus',
    'Integration is the reverse process of differentiation. The definite integral calculates the accumulated area under a curve between two points. The indefinite integral (antiderivative) finds the family of functions whose derivative is the given function. Key techniques include substitution, integration by parts, and partial fractions.',
    'Integration lets you calculate total quantities from rates: total distance from velocity, total work from force, total probability from density functions. It is essential in physics, engineering, statistics, and economics.',
    '["Calculating areas and volumes", "Computing work done by a force", "Probability distributions", "Signal and image processing"]',
    3,
    800, 100
  ),
  (
    'node_vectors',
    'Vectors',
    'vectors',
    'sub_math',
    'Linear Algebra',
    'A vector is a mathematical object with both magnitude and direction. Vectors can be added, scaled, and multiplied (dot product, cross product). They are represented as ordered lists of numbers and form the basis of linear algebra.',
    'Vectors are the language of physics and engineering. Forces, velocities, and accelerations are all vectors. They are also fundamental in computer graphics, machine learning, and data science.',
    '["Representing forces and motion in physics", "3D computer graphics and game development", "Machine learning feature vectors", "Navigation and GPS systems"]',
    2,
    200, 300
  ),
  (
    'node_trigonometry',
    'Trigonometry',
    'trigonometry',
    'sub_math',
    'Geometry',
    'Trigonometry studies the relationships between angles and sides of triangles. The six trigonometric functions (sin, cos, tan, csc, sec, cot) relate angles to ratios. Key identities include Pythagorean, double-angle, and sum/difference formulas.',
    'Trigonometry is used everywhere: physics (waves, oscillations), engineering (signal processing, structural design), navigation, astronomy, and music theory. It connects geometry to algebra through the unit circle.',
    '["Analyzing waves and oscillations", "Structural engineering calculations", "Navigation and surveying", "Audio and signal processing"]',
    2,
    400, 300
  );

-- ---- Nodes (Physics) ----
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (
    'node_velocity',
    'Velocity',
    'velocity',
    'sub_physics',
    'Kinematics',
    'Velocity is the rate of change of an object''s position with respect to time. It is a vector quantity with both speed (magnitude) and direction. Average velocity is displacement divided by time, while instantaneous velocity is the derivative of position.',
    'Understanding velocity is essential for describing and predicting motion. It connects directly to calculus through derivatives and to everyday experiences like driving, sports, and space travel.',
    '["Predicting object trajectories", "Vehicle dynamics and control", "Sports analytics", "Space mission planning"]',
    2,
    600, 300
  ),
  (
    'node_acceleration',
    'Acceleration',
    'acceleration',
    'sub_physics',
    'Kinematics',
    'Acceleration is the rate of change of velocity with respect to time. It is the second derivative of position. Objects accelerate when a net force acts on them (Newton''s second law). Constant acceleration leads to familiar kinematic equations.',
    'Acceleration explains why objects speed up, slow down, or change direction. It is the bridge between forces and motion, making it central to all of mechanics and engineering.',
    '["Vehicle braking distance calculations", "Roller coaster design", "Rocket propulsion", "Earthquake engineering"]',
    2,
    800, 300
  ),
  (
    'node_force',
    'Force',
    'force',
    'sub_physics',
    'Dynamics',
    'A force is a push or pull that can change an object''s state of motion. Described by Newton''s three laws, force is measured in Newtons (N). Types include gravitational, electromagnetic, friction, tension, normal, and applied forces. Forces are vectors and can be combined using vector addition.',
    'Force is one of the most fundamental concepts in physics. Understanding forces allows us to analyze everything from simple machines to complex engineering structures, from atomic bonds to galactic dynamics.',
    '["Structural engineering analysis", "Mechanical design", "Biomechanics", "Aerospace engineering"]',
    3,
    600, 500
  ),
  (
    'node_energy',
    'Energy',
    'energy',
    'sub_physics',
    'Mechanics',
    'Energy is the capacity to do work. It exists in many forms: kinetic (motion), potential (position), thermal (heat), chemical, electrical, and nuclear. The law of conservation of energy states that energy cannot be created or destroyed, only transformed. Work is the transfer of energy via a force.',
    'Energy is arguably the most important concept in all of physics. Conservation of energy applies universally and simplifies many problems that would be very difficult to solve with forces alone.',
    '["Power generation and energy systems", "Renewable energy engineering", "Thermodynamic analysis", "Understanding climate and weather"]',
    3,
    800, 500
  ),
  (
    'node_newtons_laws',
    'Newton''s Laws of Motion',
    'newtons-laws-of-motion',
    'sub_physics',
    'Dynamics',
    'Newton''s three laws: (1) An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a net force (inertia). (2) F = ma — the net force on an object equals its mass times its acceleration. (3) For every action, there is an equal and opposite reaction.',
    'Newton''s laws are the foundation of classical mechanics. They allow us to predict and explain the motion of everything from projectiles to planets. They remain highly accurate for everyday speeds and sizes.',
    '["Vehicle crash safety analysis", "Orbital mechanics and satellite design", "Sports physics", "Industrial machinery design"]',
    3,
    400, 500
  ),
  (
    'node_gravity',
    'Gravity',
    'gravity',
    'sub_physics',
    'Dynamics',
    'Gravity is the universal attractive force between all objects with mass. Near Earth''s surface, it causes a constant acceleration of approximately 9.8 m/s². Newton''s law of universal gravitation states F = Gm₁m₂/r². Gravity governs planetary orbits, tides, and the large-scale structure of the universe.',
    'Gravity is one of the four fundamental forces of nature. Understanding it is essential for space exploration, satellite technology, civil engineering, and understanding the cosmos.',
    '["Satellite orbit calculations", "Civil engineering (building design)", "Tidal prediction", "Understanding black holes and cosmology"]',
    3,
    200, 500
  );

-- ---- Edges (relationships between concepts) ----
INSERT INTO edges (id, source_node_id, target_node_id, relationship_type) VALUES
  -- Math internal connections
  ('edge_func_limits', 'node_functions', 'node_limits', 'leads_to'),
  ('edge_limits_deriv', 'node_limits', 'node_derivatives', 'leads_to'),
  ('edge_deriv_integ', 'node_derivatives', 'node_integration', 'related_to'),
  ('edge_trig_deriv', 'node_trigonometry', 'node_derivatives', 'used_in'),
  ('edge_func_trig', 'node_functions', 'node_trigonometry', 'related_to'),
  ('edge_vec_trig', 'node_vectors', 'node_trigonometry', 'related_to'),

  -- Math → Physics connections
  ('edge_deriv_vel', 'node_derivatives', 'node_velocity', 'application_of'),
  ('edge_deriv_accel', 'node_derivatives', 'node_acceleration', 'application_of'),
  ('edge_integ_energy', 'node_integration', 'node_energy', 'application_of'),
  ('edge_vec_force', 'node_vectors', 'node_force', 'application_of'),

  -- Physics internal connections
  ('edge_vel_accel', 'node_velocity', 'node_acceleration', 'leads_to'),
  ('edge_accel_force', 'node_acceleration', 'node_force', 'explains'),
  ('edge_force_newton', 'node_force', 'node_newtons_laws', 'explains'),
  ('edge_force_energy', 'node_force', 'node_energy', 'related_to'),
  ('edge_newton_gravity', 'node_newtons_laws', 'node_gravity', 'related_to'),
  ('edge_gravity_force', 'node_gravity', 'node_force', 'explains'),
  ('edge_energy_newton', 'node_newtons_laws', 'node_energy', 'leads_to');

-- ---- Prerequisites ----
INSERT INTO prerequisites (node_id, prerequisite_node_id) VALUES
  ('node_limits', 'node_functions'),
  ('node_derivatives', 'node_limits'),
  ('node_integration', 'node_derivatives'),
  ('node_velocity', 'node_derivatives'),
  ('node_acceleration', 'node_velocity'),
  ('node_force', 'node_vectors'),
  ('node_force', 'node_acceleration'),
  ('node_newtons_laws', 'node_force'),
  ('node_energy', 'node_force'),
  ('node_energy', 'node_integration'),
  ('node_gravity', 'node_newtons_laws');

-- ---- Mastery Tests ----
-- Test for Functions
INSERT INTO mastery_tests (id, node_id, title, description, passing_score, time_limit_minutes) VALUES
  ('test_functions', 'node_functions', 'Functions Mastery Test', 'Test your understanding of mathematical functions, domains, ranges, and function types.', 70, 10);

INSERT INTO mastery_questions (id, test_id, question_text, question_type, correct_answer, explanation, order_index) VALUES
  ('q_func_1', 'test_functions', 'What is a function in mathematics?', 'multiple_choice', 'A relation that assigns exactly one output to each input', 'A function is defined as a relation where each element of the domain is paired with exactly one element of the codomain.', 1),
  ('q_func_2', 'test_functions', 'If f(x) = 2x + 3, what is f(5)?', 'short_answer', '13', 'Substituting x=5: f(5) = 2(5) + 3 = 10 + 3 = 13.', 2),
  ('q_func_3', 'test_functions', 'Which of the following is NOT a type of function?', 'multiple_choice', 'Circular function', 'Circular is not a standard function type. Linear, quadratic, and exponential are all common function types.', 3);

INSERT INTO mastery_question_options (id, question_id, option_text, is_correct, order_index) VALUES
  ('o_func_1a', 'q_func_1', 'A relation that assigns exactly one output to each input', true, 1),
  ('o_func_1b', 'q_func_1', 'Any equation with two variables', false, 2),
  ('o_func_1c', 'q_func_1', 'A relation where inputs can have multiple outputs', false, 3),
  ('o_func_1d', 'q_func_1', 'An equation that always equals zero', false, 4),
  ('o_func_3a', 'q_func_3', 'Linear function', false, 1),
  ('o_func_3b', 'q_func_3', 'Quadratic function', false, 2),
  ('o_func_3c', 'q_func_3', 'Circular function', true, 3),
  ('o_func_3d', 'q_func_3', 'Exponential function', false, 4);

-- Test for Derivatives
INSERT INTO mastery_tests (id, node_id, title, description, passing_score, time_limit_minutes) VALUES
  ('test_derivatives', 'node_derivatives', 'Derivatives Mastery Test', 'Test your understanding of differentiation rules and applications.', 70, 15);

INSERT INTO mastery_questions (id, test_id, question_text, question_type, correct_answer, explanation, order_index) VALUES
  ('q_deriv_1', 'test_derivatives', 'What is the derivative of f(x) = x³?', 'multiple_choice', '3x²', 'Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x².', 1),
  ('q_deriv_2', 'test_derivatives', 'What does the derivative of a function represent geometrically?', 'multiple_choice', 'The slope of the tangent line', 'The derivative at a point gives the slope of the tangent line to the curve at that point.', 2),
  ('q_deriv_3', 'test_derivatives', 'What is the derivative of f(x) = 5x² + 3x - 7?', 'short_answer', '10x + 3', 'Using the power rule and sum rule: d/dx(5x²) + d/dx(3x) - d/dx(7) = 10x + 3 - 0 = 10x + 3.', 3),
  ('q_deriv_4', 'test_derivatives', 'If position s(t) = 4t² + 2t, what is the velocity at t=3?', 'short_answer', '26', 'Velocity v(t) = s''(t) = 8t + 2. At t=3: v(3) = 8(3) + 2 = 26.', 4);

INSERT INTO mastery_question_options (id, question_id, option_text, is_correct, order_index) VALUES
  ('o_deriv_1a', 'q_deriv_1', '3x²', true, 1),
  ('o_deriv_1b', 'q_deriv_1', 'x²', false, 2),
  ('o_deriv_1c', 'q_deriv_1', '3x³', false, 3),
  ('o_deriv_1d', 'q_deriv_1', '2x³', false, 4),
  ('o_deriv_2a', 'q_deriv_2', 'The area under the curve', false, 1),
  ('o_deriv_2b', 'q_deriv_2', 'The slope of the tangent line', true, 2),
  ('o_deriv_2c', 'q_deriv_2', 'The y-intercept', false, 3),
  ('o_deriv_2d', 'q_deriv_2', 'The maximum value of the function', false, 4);

-- Test for Velocity
INSERT INTO mastery_tests (id, node_id, title, description, passing_score, time_limit_minutes) VALUES
  ('test_velocity', 'node_velocity', 'Velocity Mastery Test', 'Test your understanding of velocity, speed, and motion.', 70, 10);

INSERT INTO mastery_questions (id, test_id, question_text, question_type, correct_answer, explanation, order_index) VALUES
  ('q_vel_1', 'test_velocity', 'What is the key difference between speed and velocity?', 'multiple_choice', 'Velocity includes direction, speed does not', 'Speed is a scalar (magnitude only), while velocity is a vector (magnitude + direction).', 1),
  ('q_vel_2', 'test_velocity', 'A car travels 150 km north in 2 hours. What is its average velocity?', 'short_answer', '75 km/h north', 'Average velocity = displacement / time = 150 km / 2 h = 75 km/h in the north direction.', 2),
  ('q_vel_3', 'test_velocity', 'Instantaneous velocity is defined as:', 'multiple_choice', 'The derivative of position with respect to time', 'Instantaneous velocity is the limit of average velocity as the time interval approaches zero, which is the derivative of position.', 3);

INSERT INTO mastery_question_options (id, question_id, option_text, is_correct, order_index) VALUES
  ('o_vel_1a', 'q_vel_1', 'Velocity includes direction, speed does not', true, 1),
  ('o_vel_1b', 'q_vel_1', 'Speed is always greater than velocity', false, 2),
  ('o_vel_1c', 'q_vel_1', 'They are the same thing', false, 3),
  ('o_vel_1d', 'q_vel_1', 'Velocity only applies to circular motion', false, 4),
  ('o_vel_3a', 'q_vel_3', 'Total distance divided by total time', false, 1),
  ('o_vel_3b', 'q_vel_3', 'The derivative of position with respect to time', true, 2),
  ('o_vel_3c', 'q_vel_3', 'The integral of acceleration', false, 3),
  ('o_vel_3d', 'q_vel_3', 'The average of initial and final velocity', false, 4);

-- Test for Newton's Laws
INSERT INTO mastery_tests (id, node_id, title, description, passing_score, time_limit_minutes) VALUES
  ('test_newtons_laws', 'node_newtons_laws', 'Newton''s Laws Mastery Test', 'Test your understanding of Newton''s three laws of motion.', 70, 12);

INSERT INTO mastery_questions (id, test_id, question_text, question_type, correct_answer, explanation, order_index) VALUES
  ('q_newton_1', 'test_newtons_laws', 'Newton''s First Law is also known as the law of:', 'multiple_choice', 'Inertia', 'Newton''s First Law states that an object maintains its state of rest or uniform motion unless acted upon by a net external force. This property of matter is called inertia.', 1),
  ('q_newton_2', 'test_newtons_laws', 'According to F = ma, what force is needed to accelerate a 5 kg object at 3 m/s²?', 'short_answer', '15 N', 'F = ma = 5 kg × 3 m/s² = 15 N (Newtons).', 2),
  ('q_newton_3', 'test_newtons_laws', 'Which scenario best illustrates Newton''s Third Law?', 'multiple_choice', 'A swimmer pushes water backward and moves forward', 'Newton''s Third Law states that for every action there is an equal and opposite reaction. The swimmer pushes water backward (action) and the water pushes the swimmer forward (reaction).', 3),
  ('q_newton_4', 'test_newtons_laws', 'A 10 kg box is pushed with 50 N of force and friction provides 20 N of resistance. What is the acceleration?', 'short_answer', '3 m/s²', 'Net force = 50 N - 20 N = 30 N. Using F = ma: a = F/m = 30/10 = 3 m/s².', 4);

INSERT INTO mastery_question_options (id, question_id, option_text, is_correct, order_index) VALUES
  ('o_newton_1a', 'q_newton_1', 'Inertia', true, 1),
  ('o_newton_1b', 'q_newton_1', 'Acceleration', false, 2),
  ('o_newton_1c', 'q_newton_1', 'Gravity', false, 3),
  ('o_newton_1d', 'q_newton_1', 'Momentum', false, 4),
  ('o_newton_3a', 'q_newton_3', 'A ball rolling to a stop due to friction', false, 1),
  ('o_newton_3b', 'q_newton_3', 'A swimmer pushes water backward and moves forward', true, 2),
  ('o_newton_3c', 'q_newton_3', 'A heavier object falls faster than a lighter one', false, 3),
  ('o_newton_3d', 'q_newton_3', 'An object at rest stays at rest', false, 4);

-- Test for Energy
INSERT INTO mastery_tests (id, node_id, title, description, passing_score, time_limit_minutes) VALUES
  ('test_energy', 'node_energy', 'Energy Mastery Test', 'Test your understanding of energy, work, and conservation laws.', 70, 12);

INSERT INTO mastery_questions (id, test_id, question_text, question_type, correct_answer, explanation, order_index) VALUES
  ('q_energy_1', 'test_energy', 'The law of conservation of energy states that:', 'multiple_choice', 'Energy cannot be created or destroyed, only transformed', 'This fundamental law means the total energy in an isolated system remains constant. Energy changes form but the total is always conserved.', 1),
  ('q_energy_2', 'test_energy', 'What is the kinetic energy of a 2 kg object moving at 4 m/s?', 'short_answer', '16 J', 'KE = ½mv² = ½(2)(4²) = ½(2)(16) = 16 J (Joules).', 2),
  ('q_energy_3', 'test_energy', 'Which type of energy is stored in a compressed spring?', 'multiple_choice', 'Elastic potential energy', 'A compressed spring stores elastic potential energy, which can be converted to kinetic energy when released.', 3);

INSERT INTO mastery_question_options (id, question_id, option_text, is_correct, order_index) VALUES
  ('o_energy_1a', 'q_energy_1', 'Energy can be created from nothing', false, 1),
  ('o_energy_1b', 'q_energy_1', 'Energy cannot be created or destroyed, only transformed', true, 2),
  ('o_energy_1c', 'q_energy_1', 'Energy always decreases over time', false, 3),
  ('o_energy_1d', 'q_energy_1', 'Energy is only conserved in closed containers', false, 4),
  ('o_energy_3a', 'q_energy_3', 'Kinetic energy', false, 1),
  ('o_energy_3b', 'q_energy_3', 'Thermal energy', false, 2),
  ('o_energy_3c', 'q_energy_3', 'Elastic potential energy', true, 3),
  ('o_energy_3d', 'q_energy_3', 'Chemical energy', false, 4);
