import sys; sys.path.insert(0,'.')
import quotes
from quotes import F, EX
F.update(MARC='pgl/data/tlg0007/tlg022/*grc*.xml', CLEO='f1k/data/tlg1272/tlg001/*grc1.xml',
 DC='f1k/data/tlg0552/tlg002/*grc1.xml', SC='f1k/data/tlg0552/tlg001/*grc1.xml', METH='f1k/data/tlg0552/tlg010/*grc1.xml',
 AREN='f1k/data/tlg0552/tlg006/*grc1.xml', QP='f1k/data/tlg0552/tlg007/*grc1.xml', METR='f1k/data/tlg0559/tlg006/*grc1.xml',
 DIOP='f1k/data/tlg0559/tlg007/*grc1.xml', CAT='f1k/data/tlg0559/tlg005/*grc1.xml', ARIS='f1k/data/tlg1181/tlg001/*grc1.xml')
for k,a,b in [('DC','Παντὸς κύκλου ἡ περίμετρος','ἑβδομηκοστομόνοις'),('AREN','Ἀρίσταρχος δὲ ὁ Σάμιος','περιφερείας'),
 ('METR','Ἔστι δὲ καθολικὴ μέθοδος','ἐμβαδὸν τοῦ τριγώνου'),('QP','δείκνυται γὰρ ὅτι πᾶν τμᾶμα','τῷ τμάματι'),
 ('CAT','Ἐπειδὴ γὰρ τοῦτο ὡμολογημένον','καταλαμβάνουσα'),('MARC','ἔτυχε μὲν γὰρ αὐτός','σπασάμενος τὸ ξίφος ἀνεῖλεν'),
 ('MARC','λέγεται τῶν φίλων','πρὸς τὸ περιεχόμενον'),('HDT','ἐμήκυνα δὲ περὶ Σαμίων','ἀπὸ μεγάλης πηγῆς'),('HDT','ἀρχιτέκτων δὲ τοῦ ὀρύγματος','Ναυστρόφου')]:
    try: print(k,'|',EX(k,a,b),'\n')
    except AssertionError as e: print('ERR',e)
