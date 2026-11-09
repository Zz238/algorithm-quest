import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from urllib.request import urlopen
from urllib.error import HTTPError
from serve import RecommendationHandler

class ServiceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), RecommendationHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = 'http://127.0.0.1:' + str(cls.server.server_port)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_recommendations(self):
        with urlopen(self.url + '/recommend?completed=arrays') as response:
            value = json.load(response)
            self.assertEqual(response.status, 200)
            self.assertNotIn('arrays', value['items'])
            self.assertNotIn('trees', value['items'])
            self.assertEqual(value['version'], 'content-jaccard-v1')

    def test_unknown_course(self):
        with self.assertRaises(HTTPError) as error:
            urlopen(self.url + '/recommend?completed=missing')
        self.assertEqual(error.exception.code, 400)

    def test_unknown_path(self):
        with self.assertRaises(HTTPError) as error:
            urlopen(self.url + '/other')
        self.assertEqual(error.exception.code, 404)
