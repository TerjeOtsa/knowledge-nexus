-- =============================================
-- Knowledge Nexus - Seed Data
-- Math + Physics starter knowledge graph
-- =============================================
-- Run this AFTER schema.sql

DO $$
DECLARE
  -- Subject IDs
  v_sub_math UUID := uuid_generate_v4();
  v_sub_physics UUID := uuid_generate_v4();
  -- Math Node IDs
  v_functions UUID := uuid_generate_v4();
  v_limits UUID := uuid_generate_v4();
  v_derivatives UUID := uuid_generate_v4();
  v_integration UUID := uuid_generate_v4();
  v_vectors UUID := uuid_generate_v4();
  v_trigonometry UUID := uuid_generate_v4();
  -- Physics Node IDs
  v_velocity UUID := uuid_generate_v4();
  v_acceleration UUID := uuid_generate_v4();
  v_force UUID := uuid_generate_v4();
  v_energy UUID := uuid_generate_v4();
  v_newtons_laws UUID := uuid_generate_v4();
  v_gravity UUID := uuid_generate_v4();
  -- Test IDs
  v_test_functions UUID := uuid_generate_v4();
  v_test_derivatives UUID := uuid_generate_v4();
  v_test_velocity UUID := uuid_generate_v4();
  v_test_newtons UUID := uuid_generate_v4();
  v_test_energy UUID := uuid_generate_v4();
  -- Question IDs
  v_q_func_1 UUID := uuid_generate_v4();
  v_q_func_2 UUID := uuid_generate_v4();
  v_q_func_3 UUID := uuid_generate_v4();
  v_q_deriv_1 UUID := uuid_generate_v4();
  v_q_deriv_2 UUID := uuid_generate_v4();
  v_q_deriv_3 UUID := uuid_generate_v4();
  v_q_deriv_4 UUID := uuid_generate_v4();
  v_q_vel_1 UUID := uuid_generate_v4();
  v_q_vel_2 UUID := uuid_generate_v4();
  v_q_vel_3 UUID := uuid_generate_v4();
  v_q_newton_1 UUID := uuid_generate_v4();
  v_q_newton_2 UUID := uuid_generate_v4();
  v_q_newton_3 UUID := uuid_generate_v4();
  v_q_newton_4 UUID := uuid_generate_v4();
  v_q_energy_1 UUID := uuid_generate_v4();
  v_q_energy_2 UUID := uuid_generate_v4();
  v_q_energy_3 UUID := uuid_generate_v4();
BEGIN

-- ---- Subjects ----
INSERT INTO subjects (id, name, color, description, icon) VALUES
  (v_sub_math, 'Mathematics', '#3b82f6', 'The study of numbers, quantity, structure, space, and change.', '📐'),
  (v_sub_physics, 'Physics', '#8b5cf6', 'The natural science that studies matter, energy, and their interactions.', '⚛️');

-- ---- Nodes (Mathematics) ----
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (
    v_functions, 'Functions', 'functions', v_sub_math, 'Algebra',
    'A function is a relation that assigns exactly one output value to each input value. Written as f(x), it maps elements from a domain to a codomain. Functions can be linear, quadratic, polynomial, exponential, logarithmic, and more.',
    'Functions are the fundamental building block of all mathematics and science. Every equation you write, every model you build, and every algorithm you code is essentially a function.',
    ARRAY['Modeling real-world relationships (cost vs quantity, distance vs time)', 'Programming and software development', 'Data analysis and machine learning', 'Engineering calculations'],
    1, 200, 100
  ),
  (
    v_limits, 'Limits', 'limits', v_sub_math, 'Calculus',
    'A limit describes what value a function approaches as the input approaches some value. It is the foundational concept of calculus, allowing us to reason about behavior near a point without requiring the function to actually reach that point.',
    'Limits bridge the gap between algebra and calculus. They let us define derivatives and integrals with mathematical precision. Without limits, modern physics and engineering would be impossible.',
    ARRAY['Defining derivatives and integrals', 'Analyzing function behavior near discontinuities', 'Evaluating infinite series', 'Signal processing'],
    2, 400, 100
  ),
  (
    v_derivatives, 'Derivatives', 'derivatives', v_sub_math, 'Calculus',
    'The derivative of a function measures its instantaneous rate of change at any given point. Formally defined as the limit of the difference quotient, it tells you the slope of the tangent line to the function''s graph. Key rules include power rule, product rule, quotient rule, and chain rule.',
    'Derivatives are central to optimization, physics (velocity, acceleration), economics (marginal cost/revenue), and machine learning (gradient descent).',
    ARRAY['Finding velocity and acceleration from position', 'Optimization problems (maximize profit, minimize cost)', 'Machine learning gradient descent', 'Curve sketching and analysis'],
    3, 600, 100
  ),
  (
    v_integration, 'Integration', 'integration', v_sub_math, 'Calculus',
    'Integration is the reverse process of differentiation. The definite integral calculates the accumulated area under a curve between two points. The indefinite integral finds the family of functions whose derivative is the given function.',
    'Integration lets you calculate total quantities from rates: total distance from velocity, total work from force, total probability from density functions.',
    ARRAY['Calculating areas and volumes', 'Computing work done by a force', 'Probability distributions', 'Signal and image processing'],
    3, 800, 100
  ),
  (
    v_vectors, 'Vectors', 'vectors', v_sub_math, 'Linear Algebra',
    'A vector is a mathematical object with both magnitude and direction. Vectors can be added, scaled, and multiplied (dot product, cross product). They are represented as ordered lists of numbers and form the basis of linear algebra.',
    'Vectors are the language of physics and engineering. Forces, velocities, and accelerations are all vectors. They are also fundamental in computer graphics, machine learning, and data science.',
    ARRAY['Representing forces and motion in physics', '3D computer graphics and game development', 'Machine learning feature vectors', 'Navigation and GPS systems'],
    2, 200, 300
  ),
  (
    v_trigonometry, 'Trigonometry', 'trigonometry', v_sub_math, 'Geometry',
    'Trigonometry studies the relationships between angles and sides of triangles. The six trigonometric functions (sin, cos, tan, csc, sec, cot) relate angles to ratios. Key identities include Pythagorean, double-angle, and sum/difference formulas.',
    'Trigonometry is used everywhere: physics (waves, oscillations), engineering (signal processing, structural design), navigation, astronomy, and music theory.',
    ARRAY['Analyzing waves and oscillations', 'Structural engineering calculations', 'Navigation and surveying', 'Audio and signal processing'],
    2, 400, 300
  );

-- ---- Nodes (Physics) ----
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (
    v_velocity, 'Velocity', 'velocity', v_sub_physics, 'Kinematics',
    'Velocity is the rate of change of an object''s position with respect to time. It is a vector quantity with both speed (magnitude) and direction. Average velocity is displacement divided by time, while instantaneous velocity is the derivative of position.',
    'Understanding velocity is essential for describing and predicting motion. It connects directly to calculus through derivatives and to everyday experiences like driving, sports, and space travel.',
    ARRAY['Predicting object trajectories', 'Vehicle dynamics and control', 'Sports analytics', 'Space mission planning'],
    2, 600, 300
  ),
  (
    v_acceleration, 'Acceleration', 'acceleration', v_sub_physics, 'Kinematics',
    'Acceleration is the rate of change of velocity with respect to time. It is the second derivative of position. Objects accelerate when a net force acts on them (Newton''s second law). Constant acceleration leads to familiar kinematic equations.',
    'Acceleration explains why objects speed up, slow down, or change direction. It is the bridge between forces and motion, making it central to all of mechanics and engineering.',
    ARRAY['Vehicle braking distance calculations', 'Roller coaster design', 'Rocket propulsion', 'Earthquake engineering'],
    2, 800, 300
  ),
  (
    v_force, 'Force', 'force', v_sub_physics, 'Dynamics',
    'A force is a push or pull that can change an object''s state of motion. Described by Newton''s three laws, force is measured in Newtons (N). Types include gravitational, electromagnetic, friction, tension, normal, and applied forces.',
    'Force is one of the most fundamental concepts in physics. Understanding forces allows us to analyze everything from simple machines to complex engineering structures.',
    ARRAY['Structural engineering analysis', 'Mechanical design', 'Biomechanics', 'Aerospace engineering'],
    3, 600, 500
  ),
  (
    v_energy, 'Energy', 'energy', v_sub_physics, 'Mechanics',
    'Energy is the capacity to do work. It exists in many forms: kinetic (motion), potential (position), thermal (heat), chemical, electrical, and nuclear. The law of conservation of energy states that energy cannot be created or destroyed, only transformed.',
    'Energy is arguably the most important concept in all of physics. Conservation of energy applies universally and simplifies many problems that would be very difficult to solve with forces alone.',
    ARRAY['Power generation and energy systems', 'Renewable energy engineering', 'Thermodynamic analysis', 'Understanding climate and weather'],
    3, 800, 500
  ),
  (
    v_newtons_laws, 'Newton''s Laws of Motion', 'newtons-laws-of-motion', v_sub_physics, 'Dynamics',
    'Newton''s three laws: (1) An object at rest stays at rest unless acted upon by a net force. (2) F = ma — the net force on an object equals its mass times its acceleration. (3) For every action, there is an equal and opposite reaction.',
    'Newton''s laws are the foundation of classical mechanics. They allow us to predict and explain the motion of everything from projectiles to planets.',
    ARRAY['Vehicle crash safety analysis', 'Orbital mechanics and satellite design', 'Sports physics', 'Industrial machinery design'],
    3, 400, 500
  ),
  (
    v_gravity, 'Gravity', 'gravity', v_sub_physics, 'Dynamics',
    'Gravity is the universal attractive force between all objects with mass. Near Earth''s surface, it causes a constant acceleration of approximately 9.8 m/s². Newton''s law of universal gravitation states F = Gm₁m₂/r².',
    'Gravity is one of the four fundamental forces of nature. Understanding it is essential for space exploration, satellite technology, civil engineering, and understanding the cosmos.',
    ARRAY['Satellite orbit calculations', 'Civil engineering (building design)', 'Tidal prediction', 'Understanding black holes and cosmology'],
    3, 200, 500
  );

-- ---- Edges ----
INSERT INTO edges (source_node_id, target_node_id, relationship_type) VALUES
  (v_functions, v_limits, 'leads_to'),
  (v_limits, v_derivatives, 'leads_to'),
  (v_derivatives, v_integration, 'related_to'),
  (v_trigonometry, v_derivatives, 'used_in'),
  (v_functions, v_trigonometry, 'related_to'),
  (v_vectors, v_trigonometry, 'related_to'),
  (v_derivatives, v_velocity, 'application_of'),
  (v_derivatives, v_acceleration, 'application_of'),
  (v_integration, v_energy, 'application_of'),
  (v_vectors, v_force, 'application_of'),
  (v_velocity, v_acceleration, 'leads_to'),
  (v_acceleration, v_force, 'explains'),
  (v_force, v_newtons_laws, 'explains'),
  (v_force, v_energy, 'related_to'),
  (v_newtons_laws, v_gravity, 'related_to'),
  (v_gravity, v_force, 'explains'),
  (v_newtons_laws, v_energy, 'leads_to');

-- ---- Prerequisites ----
INSERT INTO prerequisites (node_id, prerequisite_node_id) VALUES
  (v_limits, v_functions),
  (v_derivatives, v_limits),
  (v_integration, v_derivatives),
  (v_velocity, v_derivatives),
  (v_acceleration, v_velocity),
  (v_force, v_vectors),
  (v_force, v_acceleration),
  (v_newtons_laws, v_force),
  (v_energy, v_force),
  (v_energy, v_integration),
  (v_gravity, v_newtons_laws);

-- ---- Mastery Tests ----
-- Functions test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
  (v_test_functions, v_functions, 'Functions Mastery Test', 'Test your understanding of mathematical functions, domains, ranges, and function types.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
  (v_q_func_1, v_test_functions, 'multiple_choice', 'What is a function in mathematics?', 'A function is defined as a relation where each element of the domain is paired with exactly one element of the codomain.', 1),
  (v_q_func_2, v_test_functions, 'short_answer', 'If f(x) = 2x + 3, what is f(5)?', 'Substituting x=5: f(5) = 2(5) + 3 = 10 + 3 = 13.', 2),
  (v_q_func_3, v_test_functions, 'multiple_choice', 'Which of the following is NOT a type of function?', 'Circular is not a standard function type. Linear, quadratic, and exponential are all common function types.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
  (v_q_func_1, 'A relation that assigns exactly one output to each input', true, 1),
  (v_q_func_1, 'Any equation with two variables', false, 2),
  (v_q_func_1, 'A relation where inputs can have multiple outputs', false, 3),
  (v_q_func_1, 'An equation that always equals zero', false, 4),
  (v_q_func_3, 'Linear function', false, 1),
  (v_q_func_3, 'Quadratic function', false, 2),
  (v_q_func_3, 'Circular function', true, 3),
  (v_q_func_3, 'Exponential function', false, 4);

-- Derivatives test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
  (v_test_derivatives, v_derivatives, 'Derivatives Mastery Test', 'Test your understanding of differentiation rules and applications.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
  (v_q_deriv_1, v_test_derivatives, 'multiple_choice', 'What is the derivative of f(x) = x³?', 'Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x².', 1),
  (v_q_deriv_2, v_test_derivatives, 'multiple_choice', 'What does the derivative of a function represent geometrically?', 'The derivative at a point gives the slope of the tangent line to the curve at that point.', 2),
  (v_q_deriv_3, v_test_derivatives, 'short_answer', 'What is the derivative of f(x) = 5x² + 3x - 7?', 'Using the power rule and sum rule: d/dx(5x²) + d/dx(3x) - d/dx(7) = 10x + 3.', 3),
  (v_q_deriv_4, v_test_derivatives, 'short_answer', 'If position s(t) = 4t² + 2t, what is the velocity at t=3?', 'Velocity v(t) = s''(t) = 8t + 2. At t=3: v(3) = 8(3) + 2 = 26.', 4);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
  (v_q_deriv_1, '3x²', true, 1),
  (v_q_deriv_1, 'x²', false, 2),
  (v_q_deriv_1, '3x³', false, 3),
  (v_q_deriv_1, '2x³', false, 4),
  (v_q_deriv_2, 'The area under the curve', false, 1),
  (v_q_deriv_2, 'The slope of the tangent line', true, 2),
  (v_q_deriv_2, 'The y-intercept', false, 3),
  (v_q_deriv_2, 'The maximum value of the function', false, 4);

-- Velocity test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
  (v_test_velocity, v_velocity, 'Velocity Mastery Test', 'Test your understanding of velocity, speed, and motion.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
  (v_q_vel_1, v_test_velocity, 'multiple_choice', 'What is the key difference between speed and velocity?', 'Speed is a scalar (magnitude only), while velocity is a vector (magnitude + direction).', 1),
  (v_q_vel_2, v_test_velocity, 'short_answer', 'A car travels 150 km north in 2 hours. What is its average velocity?', 'Average velocity = displacement / time = 150 km / 2 h = 75 km/h north.', 2),
  (v_q_vel_3, v_test_velocity, 'multiple_choice', 'Instantaneous velocity is defined as:', 'Instantaneous velocity is the limit of average velocity as the time interval approaches zero, which is the derivative of position.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
  (v_q_vel_1, 'Velocity includes direction, speed does not', true, 1),
  (v_q_vel_1, 'Speed is always greater than velocity', false, 2),
  (v_q_vel_1, 'They are the same thing', false, 3),
  (v_q_vel_1, 'Velocity only applies to circular motion', false, 4),
  (v_q_vel_3, 'Total distance divided by total time', false, 1),
  (v_q_vel_3, 'The derivative of position with respect to time', true, 2),
  (v_q_vel_3, 'The integral of acceleration', false, 3),
  (v_q_vel_3, 'The average of initial and final velocity', false, 4);

-- Newton's Laws test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
  (v_test_newtons, v_newtons_laws, 'Newton''s Laws Mastery Test', 'Test your understanding of Newton''s three laws of motion.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
  (v_q_newton_1, v_test_newtons, 'multiple_choice', 'Newton''s First Law is also known as the law of:', 'Newton''s First Law states that an object maintains its state of rest or uniform motion unless acted upon by a net external force. This property is called inertia.', 1),
  (v_q_newton_2, v_test_newtons, 'short_answer', 'According to F = ma, what force is needed to accelerate a 5 kg object at 3 m/s²?', 'F = ma = 5 kg × 3 m/s² = 15 N.', 2),
  (v_q_newton_3, v_test_newtons, 'multiple_choice', 'Which scenario best illustrates Newton''s Third Law?', 'The swimmer pushes water backward (action) and the water pushes the swimmer forward (reaction).', 3),
  (v_q_newton_4, v_test_newtons, 'short_answer', 'A 10 kg box is pushed with 50 N of force and friction provides 20 N of resistance. What is the acceleration?', 'Net force = 50 - 20 = 30 N. a = F/m = 30/10 = 3 m/s².', 4);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
  (v_q_newton_1, 'Inertia', true, 1),
  (v_q_newton_1, 'Acceleration', false, 2),
  (v_q_newton_1, 'Gravity', false, 3),
  (v_q_newton_1, 'Momentum', false, 4),
  (v_q_newton_3, 'A ball rolling to a stop due to friction', false, 1),
  (v_q_newton_3, 'A swimmer pushes water backward and moves forward', true, 2),
  (v_q_newton_3, 'A heavier object falls faster than a lighter one', false, 3),
  (v_q_newton_3, 'An object at rest stays at rest', false, 4);

-- Energy test
INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
  (v_test_energy, v_energy, 'Energy Mastery Test', 'Test your understanding of energy, work, and conservation laws.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
  (v_q_energy_1, v_test_energy, 'multiple_choice', 'The law of conservation of energy states that:', 'This fundamental law means the total energy in an isolated system remains constant. Energy changes form but the total is always conserved.', 1),
  (v_q_energy_2, v_test_energy, 'short_answer', 'What is the kinetic energy of a 2 kg object moving at 4 m/s?', 'KE = ½mv² = ½(2)(4²) = ½(2)(16) = 16 J.', 2),
  (v_q_energy_3, v_test_energy, 'multiple_choice', 'Which type of energy is stored in a compressed spring?', 'A compressed spring stores elastic potential energy, which can be converted to kinetic energy when released.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
  (v_q_energy_1, 'Energy can be created from nothing', false, 1),
  (v_q_energy_1, 'Energy cannot be created or destroyed, only transformed', true, 2),
  (v_q_energy_1, 'Energy always decreases over time', false, 3),
  (v_q_energy_1, 'Energy is only conserved in closed containers', false, 4),
  (v_q_energy_3, 'Kinetic energy', false, 1),
  (v_q_energy_3, 'Thermal energy', false, 2),
  (v_q_energy_3, 'Elastic potential energy', true, 3),
  (v_q_energy_3, 'Chemical energy', false, 4);

END $$;
