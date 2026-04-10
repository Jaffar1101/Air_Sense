import unittest
from air_quality_agent.modules.reward import calculate_reward

class TestRewardFunction(unittest.TestCase):
    def test_ideal_case(self):
        # High Improvement (100 -> 50), High Energy, Good Filter
        delta = 50 
        # (50 * 0.6) - (1.0 * 0.25) - (0.0 * 0.15)
        # 30.0 - 0.25 - 0 = 29.75 -> Clamped to 1.0
        reward = calculate_reward(100, 50, "HIGH", 100)
        self.assertEqual(reward, 1.0)

    def test_negative_case(self):
        # Air got worse (50 -> 60), High Energy, Bad Filter
        # (-10 * 0.6) - (1.0 * 0.25) - (1.0 * 0.15)
        # -6.0 - 0.25 - 0.15 = -6.4 -> Clamped to -1.0
        reward = calculate_reward(50, 60, "HIGH", 0)
        self.assertEqual(reward, -1.0)
        
    def test_neutral_efficient_case(self):
        # No change (10 -> 10), Low Energy, Perfect Filter
        # 0.0 - (0.2 * 0.25) - 0.0
        # -0.05
        reward = calculate_reward(10, 10, "LOW", 100)
        self.assertAlmostEqual(reward, -0.05)
        
    def test_mixed_case(self):
         # Slight improvement (20 -> 19), Off
         # (1 * 0.6) - 0 - 0 = 0.6
         reward = calculate_reward(20, 19, "OFF", 100)
         self.assertAlmostEqual(reward, 0.6)

if __name__ == '__main__':
    unittest.main()
