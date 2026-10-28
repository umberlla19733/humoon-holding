import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class CatalogPrivacy(unittest.TestCase):
    def test_public_catalog_omits_sensitive_fields(self):
        for name in ('bearings', 'fasteners', 'machining', 'packing'):
            with self.subTest(name=name):
                public = json.loads((ROOT / 'data/db' / (name + '.json')).read_text())
                private = json.loads((ROOT / 'data/private/inventory' / (name + '.json')).read_text())
                self.assertEqual(len(public['products']), len(private['products']))
                self.assertEqual(public['messages'], [])
                for product in public['products']:
                    self.assertNotIn('shelf', product)
                    self.assertEqual(product['stock'], 0)
                    self.assertEqual(product['price'], 0)
                    self.assertEqual(product['priceRial'], 0)
                    self.assertTrue(product['catalog'])

if __name__ == '__main__':
    unittest.main()
