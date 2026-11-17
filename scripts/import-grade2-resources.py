"""Reproducible, bounded operator import. No AI calls, cloud writes or source application install.

Run after downloading the three pinned release metadata files and the two Grade-2
archives into data/resource-audit-20261116. Only the six reviewed lessons are emitted.
"""
from pathlib import Path
import hashlib, json, re, zipfile

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / 'data/resource-audit-20261116'
SHA = lambda data: hashlib.sha256(data).hexdigest()
REPOSITORY = 'wuwangzhang1216/congcong-school'
COMMIT = 'aca01f61446b8550b0215b7186b8df4740a97287'
PINNED_MANIFEST = '4ad974980f9be41f1ff24f8fcc3f24aa55f7d23a6cecc016689c3bd95b26e22f'

def read_json(path):
    return json.loads(path.read_text(encoding='utf8'))

def checked_archive(asset):
    raw = (WORK / asset['name']).read_bytes()
    assert len(raw) == asset['bytes'] and SHA(raw) == asset['sha256'], 'Package checksum mismatch'
    return zipfile.ZipFile(WORK / asset['name'])

assert SHA((WORK / 'manifest.json').read_bytes()) == PINNED_MANIFEST
manifest = read_json(WORK / 'manifest.json')
assert manifest['source_commit'] == COMMIT and manifest['tag'] == 'v1.8.3'
assert SHA((WORK / 'ios-manifest.json').read_bytes()) == manifest['ios_manifest']['sha256']
books = read_json(WORK / 'ios-manifest.json')['books']
book = next(b for b in books if b['bookId'] == 'g2up-2026')
data_zip, audio_zip = checked_archive(book['data']), checked_archive(book['audio'])

# Explicit semantic review of this limited unit. Not a blanket teacher endorsement.
review = [
 ('cnm_p038', 'groups', ['12','4个3相加','错','积','10','6']),
 ('cnm_p039', 'fives', ['15','20','二五一十','错','15','5']),
 ('cnm_p039', 'tables', ['8','12','16','2×3','对','12']),
 ('cnm_p057', 'extra', ['14','11','4×3','错','13','17']),
 ('cnm_p039', 'sixes', ['12','24','30','三十六','对','24']),
 ('cnm_p039', 'groups', ['4×3','15','30','错','20','3×4和4×3']),
]
topic_data = read_json(ROOT / 'curriculum_data/china/topics.json')
topics = {t['id']: t for t in (topic_data if isinstance(topic_data,list) else topic_data['topics'])}
lessons, registry, excluded = [], {}, []
assets_dir = WORK / 'r2-upload'
assets_dir.mkdir(exist_ok=True)

def binding(lesson_id, text, source_path, purpose):
    assert source_path.startswith('/audio/') and re.fullmatch(r'/audio/[0-9a-f]{2}/[0-9a-f]{40}\.mp3', source_path)
    path = source_path.lstrip('/').replace('.mp3', '.m4a')
    raw = audio_zip.read(path)
    assert len(raw) < 500000 and raw[4:8] == b'ftyp', 'Invalid AAC container'
    fingerprint = SHA(raw)
    out = assets_dir / (fingerprint + '.m4a')
    if not out.exists(): out.write_bytes(raw)
    registry.setdefault(fingerprint, {'id':fingerprint,'key':'sha256/'+fingerprint+'.m4a','bytes':len(raw),'sha256':fingerprint,'format':'audio/mp4','language':'zh-CN','sourcePath':path})
    return {'assetId':fingerprint,'textSha256':SHA(text.encode()),'text':text,'purpose':purpose,'lessonId':lesson_id}

for index, (topic_id, activity, expected) in enumerate(review, 1):
    source_id = f'g2up-2026-u2-kp{index}'
    raw = data_zip.read(f'books/g2up-2026/lessons/{source_id}.json')
    original = json.loads(raw)
    assert topics[topic_id]['grade'] == 2
    assert [q['answer'] for q in original['questions']] == expected, 'Reviewed answers changed'
    assert len({q['id'] for q in original['questions']}) == 6
    assert not re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', raw.decode()), 'Unexpected control characters'
    lesson_id = f'g2-multiply-{index:02}-v1'
    bindings, blocks, questions = [], [], []
    knowledge = original['knowledge']
    for key, label in [('core_concept','一起发现'),('key_formula','小窍门'),('tips','试着这样想')]:
        text = knowledge[key]
        b = binding(lesson_id,text,knowledge['audio'][key],'teaching');bindings.append(b)
        blocks.append({'id':key,'label':label,'text':text,'audioId':b['assetId']})
    for q in original['questions']:
        choices = None
        if q['type'] == 'choice':
            assert q['options'].count(q['answer']) == 1 and len(set(q['options'])) == len(q['options'])
            choices = [{'key':chr(65+i),'text':s} for i,s in enumerate(q['options'])]
            answer = next(c['key'] for c in choices if c['text'] == q['answer'])
        elif q['type'] == 'true_false':
            assert q['answer'] in ['对','错']
            choices=[{'key':'A','text':'对'},{'key':'B','text':'错'}]
            answer='A' if q['answer']=='对' else 'B'
        else:
            assert q['type']=='fill_blank' and re.fullmatch(r'-?\d+',q['answer'])
            answer=q['answer']
        prompt_audio=binding(lesson_id,q['question'],q['audio']['question'],'question');bindings.append(prompt_audio)
        explanation_audio=binding(lesson_id,q['explanation'],q['audio']['explanation'],'explanation');bindings.append(explanation_audio)
        choice_audio=[]
        for text,path in zip(q.get('options',[]),q['audio'].get('options',[])):
            b=binding(lesson_id,text,path,'option');bindings.append(b);choice_audio.append(b['assetId'])
        questions.append({'id':f'{lesson_id}-q{q["id"]}','topicId':topic_id,'topicName':topics[topic_id]['name'],'type':'choice' if choices else 'numeric','prompt':q['question'],'answer':answer,'explanation':q['explanation'],'promptAudioId':prompt_audio['assetId'],'explanationAudioId':explanation_audio['assetId'],**({'choices':choices,'choiceAudioIds':choice_audio} if choices else {})})
    lessons.append({'id':lesson_id,'title':original['title'],'topicId':topic_id,'grade':2,'subject':'math','term':'上','sourceLessonId':source_id,'sourceContentSha256':SHA(raw),'mappingNote':'Concept-level match to existing graph; a sublesson does not assert completion of the entire graph topic.','activity':activity,'blocks':blocks,'questions':questions,'bindings':bindings,'status':'testing'})

catalog={'schemaVersion':1,'id':'coastaltutor-g2-multiplication-v1','source':{'repository':REPOSITORY,'commit':COMMIT,'release':'v1.8.3','manifestSha256':PINNED_MANIFEST,'dataPackage':book['data'],'audioPackage':book['audio'],'contentScope':'AI-generated explanations/exercises and matched narration only; no textbook pages, passages, scans or third-party illustrations.','license':'MIT upstream notice retained; third-party textbook rights are not included.'},'lessons':lessons,'assets':list(registry.values())}
output=ROOT/'curriculum_data/china/prepared/grade2-multiplication-v1.json';output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
inventory=[]
for b in books:
    match=re.search(r'g([1-9])(?:up|down)',b['bookId'])
    inventory.append({'sourceBookId':b['bookId'],'grade':int(match[1]) if match else None,'metadataBytes':b['data']['bytes'],'audioPackageBytes':b['audio']['bytes'],'audioReferences':b['audioRefCount'],'state':'six-lessons-selected' if b['bookId']==book['bookId'] else 'not-imported','reason':'First Grade-2 math pilot; other content requires separate mapping and rights/content review.'})
outline=json.loads(data_zip.read('books/g2up-2026/outline.json'))
decisions=[{'sourceLessonId':l['id'],'title':l['title'],'decision':'accepted-trial' if l['id'] in {x['sourceLessonId'] for x in lessons} else 'pending','reason':'Bounded operator review, answer/option/graph/audio checks passed; real teacher/child acceptance remains open.' if l['id'] in {x['sourceLessonId'] for x in lessons} else 'Not yet semantically reviewed/mapped; not classified as bad.'} for l in outline['lessons']]
report={'sourceCommit':COMMIT,'release':'v1.8.3','availableBooks':inventory,'lessonDecisions':decisions,'knownHistory':{'v1.4.2':'Historical content regression; restored in v1.4.3, not a permanent exclusion.','teacherReview':'Upstream reports pending teacher/child acceptance; machine checks are not a teacher sign-off.'},'selectedLessons':len(lessons),'selectedQuestions':sum(len(l['questions']) for l in lessons),'uniqueAudioFiles':len(registry),'selectedAudioBytes':sum(a['bytes'] for a in registry.values()),'excluded':['textbook PDF/scans','textbook passages','unknown-rights illustrations','unrelated grades','historical duplicate audio formats'],'manifestContentSha256':SHA(json.dumps(catalog,ensure_ascii=False,separators=(',',':')).encode()),'firstPublication':{'lessons':1,'questions':6,'audioFiles':23,'audioBytes':217542,'state':'awaiting-R2-upload-and-publication'}}
report_path=ROOT/'eval/resources/grade2-import-audit.json';report_path.parent.mkdir(parents=True,exist_ok=True);report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(f'Prepared {len(lessons)} lessons, 36 questions, {len(registry)} unique AAC files, {report["selectedAudioBytes"]} bytes. No cloud upload or application copy.')
