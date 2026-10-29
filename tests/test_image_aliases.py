import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class ImageAliasesTest(unittest.TestCase):
    def test_old_paths_redirect_to_existing_canonical_images(self):
        aliases = {
            'images/div-cnc.jpg': 'images/hamun/weida-closeup.jpg',
            'images/div-felt.jpg': 'images/hamun/stg-bearings-seals.jpg',
            'images/div-hydraulic.jpg': 'images/hamun/machining-lathe.jpg',
            'images/div-packing.jpg': 'images/hamun/seals-shelves.jpg',
            'images/factory.jpg': 'images/hamun/workshop-main.jpg',
        }
        rules = (ROOT / '.htaccess').read_text(encoding='utf-8')
        for old, target in aliases.items():
            self.assertFalse((ROOT / old).exists(), old)
            self.assertTrue((ROOT / target).is_file(), target)
            self.assertIn('RewriteRule ^' + old.replace('.', r'\.') + '$ /' + target + ' [R=301,L,NC]', rules)


if __name__ == '__main__':
    unittest.main()
